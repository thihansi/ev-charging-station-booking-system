namespace EVChargingAPI.DTOs
{
    public class StationDto
    {
        public string? Id { get; set; }
        public string Name { get; set; } = null!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Type { get; set; } = null!;
        public int AvailableSlots { get; set; }
        public bool IsActive { get; set; }
    }
}
