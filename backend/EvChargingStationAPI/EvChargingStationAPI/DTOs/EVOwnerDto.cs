namespace EVChargingAPI.DTOs
{
    public class EVOwnerDto
    {
        public string NIC { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
