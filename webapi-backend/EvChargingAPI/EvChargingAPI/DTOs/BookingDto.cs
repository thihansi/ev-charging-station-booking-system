using EVChargingSystem.Api.Entities;

namespace EVChargingSystem.Api.DTOs
{
    public class BookingDto
    {
        public Guid Id { get; set; }
        public string EVOwnerNIC { get; set; }
        public Guid ChargingStationId { get; set; }
        public DateTime BookingDate { get; set; }
        public DateTime ReservationDateTime { get; set; }
        public BookingStatus Status { get; set; }
        public bool IsActive { get; set; }
        public string? QRCode { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class BookingSummaryDto
    {
        public Guid BookingId { get; set; }
        public string EVOwnerName { get; set; }
        public string EVOwnerNIC { get; set; }
        public string ChargingStationName { get; set; }
        public string ChargingStationAddress { get; set; }
        public DateTime ReservationDateTime { get; set; }
        public string EstimatedDuration { get; set; } = "2 hours"; // Default estimate
        public decimal EstimatedCost { get; set; } = 500.00m; // Default cost in LKR
    }

    public class BookingApprovalDto
    {
        public Guid BookingId { get; set; }
        public bool Approve { get; set; }
        public string? RejectionReason { get; set; }
    }
}