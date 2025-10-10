using EVChargingSystem.Api.Entities;

namespace EVChargingSystem.Api.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public Role Role { get; set; }
    }

    public class UpdateUserDto
    {
        public string Username { get; set; }
        public string? Password { get; set; } // Optional - only update if provided
        public Role Role { get; set; }
    }
}