namespace EVChargingAPI.DTOs
{
    public class UpdateEVOwnerDto
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
