using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EVChargingSystem.Api.Entities
{
    public enum BookingStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2,
        Completed = 3,
        Cancelled = 4
    }

    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
        
        [BsonElement("evOwnerNIC")]
        public string EVOwnerNIC { get; set; }
        
        [BsonElement("chargingStationId")]
        [BsonRepresentation(BsonType.String)]
        public Guid ChargingStationId { get; set; }
        
        [BsonElement("bookingDate")]
        public DateTime BookingDate { get; set; } = DateTime.UtcNow;
        
        [BsonElement("reservationDateTime")]
        public DateTime ReservationDateTime { get; set; }
        
        [BsonElement("status")]
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
        
        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;
        
        [BsonElement("qrCode")]
        public string? QRCode { get; set; }
        
        [BsonElement("approvedBy")]
        public string? ApprovedBy { get; set; }
        
        [BsonElement("approvedAt")]
        public DateTime? ApprovedAt { get; set; }
        
        [BsonElement("rejectionReason")]
        public string? RejectionReason { get; set; }
    }
}