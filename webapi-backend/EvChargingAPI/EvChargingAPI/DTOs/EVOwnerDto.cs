namespace EVChargingSystem.Api.DTOs
{
    public class EVOwnerDto
    {
        public string NIC { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool IsActive { get; set; }
    }
}