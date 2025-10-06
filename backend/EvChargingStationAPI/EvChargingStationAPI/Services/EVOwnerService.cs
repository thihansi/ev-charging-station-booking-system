using EVChargingAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace EVChargingAPI.Services
{
    public class EVOwnerDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string EVOwnerCollectionName { get; set; } = null!;
    }

    public class EVOwnerService
    {
        private readonly IMongoCollection<EVOwner> _evOwners;

        public EVOwnerService(IOptions<EVOwnerDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var db = client.GetDatabase(settings.Value.DatabaseName);
            _evOwners = db.GetCollection<EVOwner>(settings.Value.EVOwnerCollectionName);
        }

        public async Task CreateAsync(EVOwner owner) => await _evOwners.InsertOneAsync(owner);

        public async Task<EVOwner?> GetByNicAsync(string nic) =>
            await _evOwners.Find(o => o.NIC == nic).FirstOrDefaultAsync();

        public async Task<List<EVOwner>> GetAllAsync() =>
            await _evOwners.Find(_ => true).ToListAsync();

        public async Task UpdateAsync(string nic, EVOwner owner) =>
            await _evOwners.ReplaceOneAsync(o => o.NIC == nic, owner);

        public async Task<bool> DeactivateAsync(string nic)
        {
            var update = Builders<EVOwner>.Update.Set(o => o.IsActive, false);
            var res = await _evOwners.UpdateOneAsync(o => o.NIC == nic, update);
            return res.ModifiedCount > 0;
        }

        public async Task<bool> ExistsAsync(string nic) =>
            await _evOwners.Find(o => o.NIC == nic).AnyAsync();

        public async Task<EVOwner?> ValidateCredentialsAsync(string nic, string password)
        {
            var owner = await GetByNicAsync(nic);
            if (owner == null || !owner.IsActive) return null;
            bool ok = BCrypt.Net.BCrypt.Verify(password, owner.PasswordHash);
            return ok ? owner : null;
        }
    }
}
