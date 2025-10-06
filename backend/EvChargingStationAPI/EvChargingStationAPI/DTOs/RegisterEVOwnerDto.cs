namespace EVChargingAPI.DTOs
{
    public class RegisterEVOwnerDto
    {
        public string NIC { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
