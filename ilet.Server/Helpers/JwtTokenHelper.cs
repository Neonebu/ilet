namespace ilet.Server.Helpers
{
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;

    public static class JwtTokenHelper
    {
        public static int? ExtractUserId(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);

            var claim = jwt.Claims.FirstOrDefault(c =>
                c.Type == ClaimTypes.NameIdentifier ||              // ASP.NET default
                c.Type == JwtRegisteredClaimNames.Sub ||            // standard
                c.Type == "sub" ||                                  // raw string
                c.Type == "nameid" ||                               // sık kullanılan başka bir alias
                c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier" // senin token’daki hali
            );

            if (claim != null && int.TryParse(claim.Value, out var userId))
                return userId;

            return null;
        }

    }
}
