namespace EVChargingAPI.DTOs
{
    public class ReservationDto
    {
        public string? Id { get; set; }
        public string OwnerNIC { get; set; } = null!;
        public string StationId { get; set; } = null!;
        public DateTime ReservationDateTimeUtc { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedAtUtc { get; set; }
    }
}
