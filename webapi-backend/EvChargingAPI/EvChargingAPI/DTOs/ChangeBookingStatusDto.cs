using EVChargingSystem.Api.Entities;

namespace EVChargingSystem.Api.DTOs
{
    public class ChangeBookingStatusDto
    {
        public BookingStatus NewStatus { get; set; }
        public string? Reason { get; set; }
    }
}