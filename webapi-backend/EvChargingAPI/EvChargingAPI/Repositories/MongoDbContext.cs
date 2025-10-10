using EVChargingSystem.Api.Entities;
using MongoDB.Driver;
using Microsoft.Extensions.Configuration;

namespace EVChargingSystem.Api.Repositories
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            var mongoClient = new MongoClient(connectionString);
            
            // Extract database name from connection string or use default
            var databaseName = MongoUrl.Create(connectionString).DatabaseName ?? "EVChargingSystem";
            _database = mongoClient.GetDatabase(databaseName);
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
        public IMongoCollection<EVOwner> EVOwners => _database.GetCollection<EVOwner>("EVOwners");
        public IMongoCollection<ChargingStation> ChargingStations => _database.GetCollection<ChargingStation>("ChargingStations");
        public IMongoCollection<Booking> Bookings => _database.GetCollection<Booking>("Bookings");
    }
}