using EVChargingAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace EVChargingAPI.Services
{
    public class ReservationDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string ReservationCollectionName { get; set; } = null!;
    }

    public class ReservationService
    {
        private readonly IMongoCollection<Reservation> _reservations;

        public ReservationService(IOptions<ReservationDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var db = client.GetDatabase(settings.Value.DatabaseName);
            _reservations = db.GetCollection<Reservation>(settings.Value.ReservationCollectionName);
        }

        public async Task CreateAsync(Reservation r) => await _reservations.InsertOneAsync(r);

        public async Task<Reservation?> GetByIdAsync(string id) =>
            await _reservations.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<List<Reservation>> GetByOwnerAsync(string nic) =>
            await _reservations.Find(r => r.OwnerNIC == nic).ToListAsync();

        public async Task<List<Reservation>> GetActiveReservationsForStationAsync(string stationId) =>
            await _reservations.Find(r => r.StationId == stationId && r.Status != "Cancelled" && r.ReservationDateTimeUtc >= DateTime.UtcNow).ToListAsync();

        public async Task UpdateAsync(string id, Reservation r) =>
            await _reservations.ReplaceOneAsync(x => x.Id == id, r);

        public async Task DeleteAsync(string id) =>
            await _reservations.DeleteOneAsync(x => x.Id == id);
    }
}
