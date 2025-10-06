using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EVChargingSystem.Api.Entities
{
    public class EVOwner
    {
        [BsonId]
        [BsonElement("nic")]
        public string NIC { get; set; }
        
        [BsonElement("name")]
        public string Name { get; set; }
        
        [BsonElement("email")]
        public string Email { get; set; }
        
        [BsonElement("phone")]
        public string Phone { get; set; }
        
        [BsonElement("passwordHash")]
        public string? PasswordHash { get; set; }
        
        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;
        
        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [BsonElement("lastLoginAt")]
        public DateTime? LastLoginAt { get; set; }
        
        [BsonElement("deactivatedAt")]
        public DateTime? DeactivatedAt { get; set; }
        
        [BsonElement("deactivatedBy")]
        public string? DeactivatedBy { get; set; } // "self" or username who deactivated
        
        [BsonElement("reactivatedAt")]
        public DateTime? ReactivatedAt { get; set; }
        
        [BsonElement("reactivatedBy")]
        public string? ReactivatedBy { get; set; }
    }
}