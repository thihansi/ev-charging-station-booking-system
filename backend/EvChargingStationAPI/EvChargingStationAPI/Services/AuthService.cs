using EVChargingAPI.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EVChargingAPI.Services
{
    public class JwtSettings
    {
        public string Secret { get; set; } = null!;
        public string Issuer { get; set; } = null!;
        public string Audience { get; set; } = null!;
        public int ExpiryMinutes { get; set; }
    }

    public class AuthService
    {
        private readonly JwtSettings _jwtSettings;

        public AuthService(IConfiguration config)
        {
            _jwtSettings = config.GetSection("JwtSettings").Get<JwtSettings>()!;
        }

        public string GenerateTokenForUser(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Determine role string based on booleans; Backoffice has precedence
            var role = user.IsBackoffice ? "Backoffice" :
                       user.IsStationOperator ? "StationOperator" : "User";

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim("role", role),
                new Claim("isBackoffice", user.IsBackoffice.ToString().ToLower()),
                new Claim("isStationOperator", user.IsStationOperator.ToString().ToLower())
            };

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateTokenForEVOwner(Models.EVOwner owner)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, owner.NIC),
                new Claim("role", "EVOwner")
            };

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public int GetExpiryMinutes() => _jwtSettings.ExpiryMinutes;
    }
}
