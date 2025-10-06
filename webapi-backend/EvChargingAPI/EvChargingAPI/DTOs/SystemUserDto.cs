using EVChargingSystem.Api.Entities;

namespace EVChargingSystem.Api.DTOs
{
    public class CreateBackofficeUserDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
    }

    public class CreateStationOperatorDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string AssignedStationId { get; set; }
    }

    public class SystemUserResponseDto
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public Role Role { get; set; }
        public string Message { get; set; }
    }
}