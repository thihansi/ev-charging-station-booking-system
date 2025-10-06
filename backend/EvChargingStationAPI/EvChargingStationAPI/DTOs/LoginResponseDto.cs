namespace EVChargingAPI.DTOs
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = null!;
        public string TokenType { get; set; } = "Bearer";
        public int ExpiresInMinutes { get; set; }
        public object? User { get; set; }
    }
}
