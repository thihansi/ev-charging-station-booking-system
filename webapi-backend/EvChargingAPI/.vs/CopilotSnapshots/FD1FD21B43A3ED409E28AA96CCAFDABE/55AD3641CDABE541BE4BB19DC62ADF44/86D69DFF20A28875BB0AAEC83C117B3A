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

        public async Task<IEnumerable<UserDto>> GetAllUsers()
        {
            var users = await _context.Users.Find(_ => true).ToListAsync();
            return users.Select(u => new UserDto 
            { 
                Id = u.Id, 
                Username = u.Username, 
                Role = u.Role 
            });
        }

        public async Task<UserDto> GetUserById(Guid id)
        {
            var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (user == null)
                throw new Exception("User not found");

            return new UserDto 
            { 
                Id = user.Id, 
                Username = user.Username, 
                Role = user.Role 
            };
        }

        public async Task<UserDto> UpdateUser(Guid id, UpdateUserDto dto)
        {
            var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (user == null)
                throw new Exception("User not found");

            // Check if username is being changed and if it already exists
            if (dto.Username != user.Username)
            {
                var existingUser = await _context.Users.Find(u => u.Username == dto.Username).FirstOrDefaultAsync();
                if (existingUser != null)
                    throw new Exception("Username already exists");
            }

            var updateBuilder = Builders<User>.Update
                .Set(u => u.Username, dto.Username)
                .Set(u => u.Role, dto.Role);

            // Only update password if provided
            if (!string.IsNullOrEmpty(dto.Password))
            {
                if (dto.Password.Length < 6)
                    throw new Exception("Password must be at least 6 characters long");
                    
                updateBuilder = updateBuilder.Set(u => u.PasswordHash, BCrypt.Net.BCrypt.HashPassword(dto.Password));
            }

            await _context.Users.UpdateOneAsync(u => u.Id == id, updateBuilder);

            // Return updated user data
            user.Username = dto.Username;
            user.Role = dto.Role;

            return new UserDto 
            { 
                Id = user.Id, 
                Username = user.Username, 
                Role = user.Role 
            };
        }

        public async Task DeleteUser(Guid id)
        {
            var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (user == null)
                throw new Exception("User not found");

            await _context.Users.DeleteOneAsync(u => u.Id == id);
        }
    }
}