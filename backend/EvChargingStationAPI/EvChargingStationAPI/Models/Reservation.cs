using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EVChargingAPI.Models
{
    public class Reservation
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // Owner NIC (FK)
        [BsonElement("ownerNIC")]
        [BsonRepresentation(BsonType.String)]
        public string OwnerNIC { get; set; } = null!;

        // Station Id
        [BsonElement("stationId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string StationId { get; set; } = null!;

        // Reservation date/time UTC
        [BsonElement("reservationDateTimeUtc")]
        public DateTime ReservationDateTimeUtc { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "Pending"; // Pending, Approved, Cancelled, Completed

        [BsonElement("createdAtUtc")]
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
