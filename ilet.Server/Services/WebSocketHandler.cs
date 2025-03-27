using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace ilet.Server.Services
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
                    // Client'dan mesaj gelirse buraya düşer
                    var msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    //Console.WriteLine($"Received from {userId}: {msg}");
                }
            }
        }

        // Event: Status değişimlerini herkese broadcast edelim
        public static async Task BroadcastStatusUpdate()
        {
            var payload = new
            {
                eventType = "status-update",
                timestamp = DateTime.UtcNow
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
        }
    }

}
