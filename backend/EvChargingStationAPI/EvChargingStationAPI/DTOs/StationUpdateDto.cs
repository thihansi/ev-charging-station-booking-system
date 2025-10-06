namespace EVChargingAPI.DTOs
{
    public class StationUpdateDto
    {
        public string Name { get; set; } = null!;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Type { get; set; } = "AC";
        public int AvailableSlots { get; set; }
        public bool IsActive { get; set; }
    }
}
