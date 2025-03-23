using System.Net.WebSockets;
using System.Text;

namespace ilet.Server.Services
{
    public static class WebSocketHandler
    {
        public static async Task HandleConnection(WebSocket socket)
        {
            var buffer = new byte[1024 * 4];

            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by client", CancellationToken.None);
                }
                else if (result.MessageType == WebSocketMessageType.Text)
                {
                    var msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    // Burada mesajı alırız ve yayarız
                    Console.WriteLine("Received: " + msg);
                }
            }
        }
    }

}
