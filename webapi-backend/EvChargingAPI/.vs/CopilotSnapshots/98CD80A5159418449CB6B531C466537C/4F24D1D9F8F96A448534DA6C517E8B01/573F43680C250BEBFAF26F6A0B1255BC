using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EVChargingSystem.Api.Entities
{
    public class ChargingStation
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
        
        [BsonElement("name")]
        public string Name { get; set; }
        
        [BsonElement("address")]
        public string Address { get; set; }  // Input address, will geocode to Lat/Lng
        
        [BsonElement("latitude")]
        public double Latitude { get; set; }
        
        [BsonElement("longitude")]
        public double Longitude { get; set; }
        
        [BsonElement("type")]
        public StationType Type { get; set; }
        
        [BsonElement("availableSlots")]
        public int AvailableSlots { get; set; }
        
        [BsonElement("schedule")]
        public string Schedule { get; set; }  // JSON string or simple string for availability
        
        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;
    }
}