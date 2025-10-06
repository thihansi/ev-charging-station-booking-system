namespace EVChargingAPI.DTOs
{
    public class ReservationCreateDto
    {
        public string OwnerNIC { get; set; } = null!;
        public string StationId { get; set; } = null!;
        public DateTime ReservationDateTimeUtc { get; set; }
    }
}
