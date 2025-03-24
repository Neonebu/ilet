using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace ilet.Server.Services
{
    public static class WebSocketHandler
    {
        private static readonly Dictionary<int, WebSocket> Connections = new();

        public static async Task HandleConnection(int userId, WebSocket socket)
        {
            Connections[userId] = socket;
            await BroadcastStatus(userId, "user-online");

            var buffer = new byte[1024 * 4];

            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by client", CancellationToken.None);
                    Connections.Remove(userId);
                    await BroadcastStatus(userId, "user-offline");
                }
                else if (result.MessageType == WebSocketMessageType.Text)
                {
                    var msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine("Received: " + msg);
                    // İstersen buraya da özel mesaj/event publish ekleyebilirsin
                }
            }
        }

        private static async Task BroadcastStatus(int userId, string eventType)
        {
            var payload = JsonSerializer.Serialize(new { eventType, userId });
            var payloadBytes = Encoding.UTF8.GetBytes(payload);

            foreach (var kvp in Connections)
            {
                var ws = kvp.Value;
                if (ws.State == WebSocketState.Open)
                {
                    await ws.SendAsync(new ArraySegment<byte>(payloadBytes), WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }

            Console.WriteLine($"[Broadcast] {eventType} for userId: {userId}");
        }
    }
}
