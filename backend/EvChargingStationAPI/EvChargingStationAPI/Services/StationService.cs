using EVChargingAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace EVChargingAPI.Services
{
    public class StationDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string StationCollectionName { get; set; } = null!;
    }

    public class StationService
    {
        private readonly IMongoCollection<Station> _stations;

        public StationService(IOptions<StationDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var db = client.GetDatabase(settings.Value.DatabaseName);
            _stations = db.GetCollection<Station>(settings.Value.StationCollectionName);
        }

        public async Task CreateAsync(Station s) => await _stations.InsertOneAsync(s);

        public async Task<Station?> GetByIdAsync(string id) =>
            await _stations.Find(s => s.Id == id).FirstOrDefaultAsync();

        public async Task<List<Station>> GetAllAsync() =>
            await _stations.Find(_ => true).ToListAsync();

        public async Task UpdateAsync(string id, Station station) =>
            await _stations.ReplaceOneAsync(s => s.Id == id, station);

        public async Task<bool> DeactivateAsync(string id)
        {
            var update = Builders<Station>.Update.Set(s => s.IsActive, false);
            var res = await _stations.UpdateOneAsync(s => s.Id == id, update);
            return res.ModifiedCount > 0;
        }
    }
}
