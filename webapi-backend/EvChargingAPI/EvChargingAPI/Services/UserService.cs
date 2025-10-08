using EVChargingSystem.Api.Configurations;
using EVChargingSystem.Api.DTOs;
using EVChargingSystem.Api.Entities;
using EVChargingSystem.Api.Repositories;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace EVChargingSystem.Api.Services
{
    public class UserService : IUserService
    {
        private readonly MongoDbContext _context;
        private readonly JwtConfig _jwtConfig;

        public UserService(MongoDbContext context, JwtConfig jwtConfig)
        {
            _context = context;
            _jwtConfig = jwtConfig;
        }

        public async Task<UserDto> CreateUser(string username, string password, Role role)
        {
            var existingUser = await _context.Users.Find(u => u.Username == username).FirstOrDefaultAsync();
            if (existingUser != null)
                throw new Exception("Username already exists");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = role
            };

            await _context.Users.InsertOneAsync(user);
            return new UserDto { Id = user.Id, Username = user.Username, Role = user.Role };
        }

        public async Task<string> Authenticate(string username, string password)
        {
            var user = await _context.Users.Find(u => u.Username == username).FirstOrDefaultAsync();
            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                throw new Exception("Invalid credentials");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtConfig.Key);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpiryMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _jwtConfig.Issuer,
                Audience = _jwtConfig.Audience
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<List<UserDto>> GetAllUsers()
        {
            var users = await _context.Users.Find(_ => true).ToListAsync();
            return users.Select(u => new UserDto 
            { 
                Id = u.Id, 
                Username = u.Username, 
                Role = u.Role 
            }).ToList();
        }
    }
}