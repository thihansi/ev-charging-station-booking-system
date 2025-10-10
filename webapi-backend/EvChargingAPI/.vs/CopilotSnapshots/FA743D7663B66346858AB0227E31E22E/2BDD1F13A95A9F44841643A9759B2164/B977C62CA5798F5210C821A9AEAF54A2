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
    public class EVOwnerService : IEVOwnerService
    {
        private readonly MongoDbContext _context;
        private readonly JwtConfig _jwtConfig;

        public EVOwnerService(MongoDbContext context, JwtConfig jwtConfig)
        {
            _context = context;
            _jwtConfig = jwtConfig;
        }

        public async Task<EVOwnerDto> RegisterEVOwner(EVOwnerRegistrationDto dto)
        {
            var existingOwner = await _context.EVOwners.Find(o => o.NIC == dto.NIC).FirstOrDefaultAsync();
            if (existingOwner != null)
                throw new Exception("NIC already exists");

            var existingEmail = await _context.EVOwners.Find(o => o.Email == dto.Email).FirstOrDefaultAsync();
            if (existingEmail != null)
                throw new Exception("Email already exists");

            var owner = new EVOwner
            {
                NIC = dto.NIC,
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _context.EVOwners.InsertOneAsync(owner);
            
            return new EVOwnerDto
            {
                NIC = owner.NIC,
                Name = owner.Name,
                Email = owner.Email,
                Phone = owner.Phone,
                IsActive = owner.IsActive
            };
        }

        public async Task<EVOwnerLoginResponseDto> AuthenticateEVOwner(EVOwnerLoginDto dto)
        {
            var owner = await _context.EVOwners.Find(o => o.NIC == dto.NIC).FirstOrDefaultAsync();
            if (owner == null || string.IsNullOrEmpty(owner.PasswordHash) || !BCrypt.Net.BCrypt.Verify(dto.Password, owner.PasswordHash))
                throw new Exception("Invalid NIC or password");

            if (!owner.IsActive)
                throw new Exception("Account is deactivated. Please contact support for reactivation.");

            // Update last login time
            var update = Builders<EVOwner>.Update.Set(o => o.LastLoginAt, DateTime.UtcNow);
            await _context.EVOwners.UpdateOneAsync(o => o.NIC == dto.NIC, update);

            var token = GenerateJwtToken(owner);

            return new EVOwnerLoginResponseDto
            {
                Token = token,
                EVOwner = new EVOwnerDto
                {
                    NIC = owner.NIC,
                    Name = owner.Name,
                    Email = owner.Email,
                    Phone = owner.Phone,
                    IsActive = owner.IsActive
                }
            };
        }

        private string GenerateJwtToken(EVOwner owner)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtConfig.Key);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.Name, owner.NIC),
                    new Claim(ClaimTypes.Email, owner.Email),
                    new Claim(ClaimTypes.Role, "EVOwner"),
                    new Claim("nic", owner.NIC)
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtConfig.ExpiryMinutes),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = _jwtConfig.Issuer,
                Audience = _jwtConfig.Audience
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<EVOwnerDto> GetEVOwnerByNIC(string nic)
        {
            var owner = await _context.EVOwners.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null) throw new Exception("EVOwner not found");

            return new EVOwnerDto
            {
                NIC = owner.NIC,
                Name = owner.Name,
                Email = owner.Email,
                Phone = owner.Phone,
                IsActive = owner.IsActive
            };
        }

        public async Task<EVOwnerDto> SelfUpdateProfile(string nic, EVOwnerDto dto)
        {
            var owner = await _context.EVOwners.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null) throw new Exception("EVOwner not found");

            if (!owner.IsActive) throw new Exception("Cannot update profile of inactive account");

            // EV owners can only update name, email, and phone
            var update = Builders<EVOwner>.Update
                .Set(o => o.Name, dto.Name)
                .Set(o => o.Email, dto.Email)
                .Set(o => o.Phone, dto.Phone);

            await _context.EVOwners.UpdateOneAsync(o => o.NIC == nic, update);
            
            return new EVOwnerDto
            {
                NIC = nic,
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                IsActive = true // Always true for active accounts
            };
        }

        public async Task SelfDeactivateAccount(string nic)
        {
            var owner = await _context.EVOwners.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null) throw new Exception("EVOwner not found");

            if (!owner.IsActive) throw new Exception("Account is already deactivated");

            // Check for active bookings
            var hasActiveBookings = await _context.Bookings
                .Find(b => b.EVOwnerNIC == nic && b.IsActive && b.Status != BookingStatus.Completed && b.Status != BookingStatus.Cancelled)
                .AnyAsync();

            if (hasActiveBookings)
                throw new Exception("Cannot deactivate account with active bookings. Please cancel or complete your bookings first.");

            var update = Builders<EVOwner>.Update
                .Set(o => o.IsActive, false)
                .Set(o => o.DeactivatedAt, DateTime.UtcNow)
                .Set(o => o.DeactivatedBy, "self");

            await _context.EVOwners.UpdateOneAsync(o => o.NIC == nic, update);
        }

        public async Task<bool> CanReactivateAccount(string nic)
        {
            var owner = await _context.EVOwners.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            return owner != null && !owner.IsActive && owner.DeactivatedBy != null;
        }

        public async Task ReactivateAccount(string nic, string reactivatedBy)
        {
            var owner = await _context.EVOwners.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null) throw new Exception("EVOwner not found");

            if (owner.IsActive) throw new Exception("Account is already active");

            var update = Builders<EVOwner>.Update
                .Set(o => o.IsActive, true)
                .Set(o => o.ReactivatedAt, DateTime.UtcNow)
                .Set(o => o.ReactivatedBy, reactivatedBy);

            await _context.EVOwners.UpdateOneAsync(o => o.NIC == nic, update);
        }

        // Existing methods remain the same
        public async Task<EVOwnerDto> CreateEVOwner(EVOwnerDto dto)
        {
            var existingOwner = await _context.EVOwners.Find(o => o.NIC == dto.NIC).FirstOrDefaultAsync();
            if (existingOwner != null)
                throw new Exception("NIC already exists");

            var owner = new EVOwner
            {
                NIC = dto.NIC,
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await _context.EVOwners.InsertOneAsync(owner);
            return dto;
        }

        public async Task<EVOwnerDto> UpdateEVOwner(string nic, EVOwnerDto dto)
        {
            var owner = await _context.EVOwners.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null) throw new Exception("EVOwner not found");

            var update = Builders<EVOwner>.Update
                .Set(o => o.Name, dto.Name)
                .Set(o => o.Email, dto.Email)
                .Set(o => o.Phone, dto.Phone)
                .Set(o => o.IsActive, dto.IsActive);

            await _context.EVOwners.UpdateOneAsync(o => o.NIC == nic, update);
            return dto;
        }

        public async Task DeleteEVOwner(string nic)
        {
            var owner = await _context.EVOwners.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null) throw new Exception("EVOwner not found");

            await _context.EVOwners.DeleteOneAsync(o => o.NIC == nic);
        }

        public async Task ActivateEVOwner(string nic)
        {
            var owner = await _context.EVOwners.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null) throw new Exception("EVOwner not found");
            
            var update = Builders<EVOwner>.Update
                .Set(o => o.IsActive, true)
                .Set(o => o.ReactivatedAt, DateTime.UtcNow)
                .Set(o => o.ReactivatedBy, "backoffice");
            
            await _context.EVOwners.UpdateOneAsync(o => o.NIC == nic, update);
        }

        public async Task DeactivateEVOwner(string nic)
        {
            var owner = await _context.EVOwners.Find(o => o.NIC == nic).FirstOrDefaultAsync();
            if (owner == null) throw new Exception("EVOwner not found");
            
            var update = Builders<EVOwner>.Update
                .Set(o => o.IsActive, false)
                .Set(o => o.DeactivatedAt, DateTime.UtcNow)
                .Set(o => o.DeactivatedBy, "backoffice");
            
            await _context.EVOwners.UpdateOneAsync(o => o.NIC == nic, update);
        }
    }
}