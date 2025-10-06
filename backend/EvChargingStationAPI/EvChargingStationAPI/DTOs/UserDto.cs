namespace EVChargingAPI.DTOs
{
    public class UserDto
    {
        public string? Id { get; set; }
        public string Username { get; set; } = null!;
        public bool IsBackoffice { get; set; }
        public bool IsStationOperator { get; set; }
        public string Role { get; set; } = null!;
    }
}
