namespace EVChargingSystem.Api.DTOs
{
    public class EVOwnerLoginResponseDto
    {
        public string Token { get; set; }
        public EVOwnerDto EVOwner { get; set; }
    }
}