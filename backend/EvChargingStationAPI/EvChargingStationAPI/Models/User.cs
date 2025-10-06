using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EVChargingAPI.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("username")]
        public string Username { get; set; } = null!;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = null!;

        // Role booleans as requested
        [BsonElement("isBackoffice")]
        public bool IsBackoffice { get; set; } = false;

        [BsonElement("isStationOperator")]
        public bool IsStationOperator { get; set; } = false;

        // convenience: store role string in claims too (Backoffice / StationOperator)
        [BsonElement("role")]
        public string Role { get; set; } = "StationOperator";
    }
}
