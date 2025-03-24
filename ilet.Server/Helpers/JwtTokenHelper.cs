namespace ilet.Server.Helpers
{
    using System.IdentityModel.Tokens.Jwt;
    public static class JwtTokenHelper
    {
        public static int? ExtractUserId(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            var userIdClaim = jwt.Claims.FirstOrDefault(c => c.Type == "nameid");

            return userIdClaim != null ? int.Parse(userIdClaim.Value) : null;
        }
    }
}
