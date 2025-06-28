namespace ilet.server.Dtos
{
    public class FriendRequestsResponseDto
    {
        public List<FriendRequestDto> Received { get; set; } = new();
        public List<FriendRequestDto> Sent { get; set; } = new();
    }

}
