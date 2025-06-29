using ilet.server.Context;
using ilet.server.Models;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace ilet.server.Services
{
    public static class WebSocketHandler
    {
        private static ConcurrentDictionary<int, WebSocket> _sockets = new ConcurrentDictionary<int, WebSocket>();

        public static async Task HandleConnection(int userId, WebSocket socket)
        {
            _sockets.TryAdd(userId, socket);

            var buffer = new byte[1024 * 4];

            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    _sockets.TryRemove(userId, out _);
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by client", CancellationToken.None);
                }
                else if (result.MessageType == WebSocketMessageType.Text)
                {
                    var msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine($"Mesaj alındı: {msg}");

                    try
                    {
                        using var doc = JsonDocument.Parse(msg);
                        var root = doc.RootElement;

                        if (root.TryGetProperty("type", out var typeProp))
                        {
                            var type = typeProp.GetString();

                            if (type == "status-update")
                            {
                                var userIdVal = root.GetProperty("userId").GetInt32();
                                var nicknameVal = root.GetProperty("nickname").GetString();
                                var statusVal = root.GetProperty("status").GetString();

                                await BroadcastStatusUpdate(userIdVal, nicknameVal, statusVal, null);
                                Console.WriteLine($"status-update broadcast ediliyor: {msg}");
                            }
                            else if (type == "chat-message")
                            {
                                var receiverId = root.GetProperty("receiverId").GetInt32();

                                if (_sockets.TryGetValue(receiverId, out var targetSocket))
                                {
                                    if (targetSocket.State == WebSocketState.Open)
                                    {
                                        var json = JsonSerializer.Serialize(root);
                                        var bytes = Encoding.UTF8.GetBytes(json);
                                        var segment = new ArraySegment<byte>(bytes);
                                        await targetSocket.SendAsync(segment, WebSocketMessageType.Text, true, CancellationToken.None);
                                    }
                                }
                            }
                        }
                    }
                    catch (JsonException ex)
                    {
                        Console.WriteLine($"JSON parse hatası: {ex.Message}");
                    }
                }
            }
        }

        public static async Task BroadcastStatusUpdate(int? userId, string? nickname, string? status, string? email)
        {
            var safeNickname = string.IsNullOrWhiteSpace(nickname) ? email : nickname;
            var safeStatus = string.IsNullOrWhiteSpace(status) ? "offline" : status;

            bool isWorldVisible = false;
            try
            {
                using var db = new AppDbContext();
                var user = await db.Users.FindAsync(userId);
                isWorldVisible = user?.IsWorldVisible ?? false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Veritabanı hatası: {ex.Message}");
            }

            var payload = new
            {
                type = "status-update",
                userId = userId,
                nickname = safeNickname,
                status = safeStatus,
                isWorldVisible = isWorldVisible
            };

            var json = JsonSerializer.Serialize(payload);
            var bytes = Encoding.UTF8.GetBytes(json);
            var segment = new ArraySegment<byte>(bytes);

            foreach (var socket in _sockets.Values)
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(segment, WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }

            Console.WriteLine("status-update broadcast edildi: " + json);
        }
    }
}
