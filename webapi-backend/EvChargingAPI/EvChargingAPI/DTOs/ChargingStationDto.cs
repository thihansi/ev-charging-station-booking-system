using EVChargingSystem.Api.Entities;

namespace EVChargingSystem.Api.DTOs
{
    public class ChargingStationDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }  // For input/output
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public StationType Type { get; set; }
        public int AvailableSlots { get; set; }
        public string Schedule { get; set; }
        public bool IsActive { get; set; }
    }
}