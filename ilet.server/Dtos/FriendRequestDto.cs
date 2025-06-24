namespace ilet.server.Dtos
{
    public class FriendRequestDto
    {
        public int Id { get; set; }
        public int RequesterId { get; set; }
        public string? RequesterNickname { get; set; }
        public int Status { get; set; }  // ← EKLE!
    }
}
