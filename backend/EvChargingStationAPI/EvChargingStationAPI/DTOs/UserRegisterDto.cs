namespace EVChargingAPI.DTOs
{
    public class UserRegisterDto
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public bool IsBackoffice { get; set; } = false;
        public bool IsStationOperator { get; set; } = false;
    }
}
