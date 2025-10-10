using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EVChargingSystem.Api.Entities
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
        
        [BsonElement("username")]
        public string Username { get; set; }
        
        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; }  // Use BCrypt or similar for hashing
        
        [BsonElement("role")]
        public Role Role { get; set; }
    }
}