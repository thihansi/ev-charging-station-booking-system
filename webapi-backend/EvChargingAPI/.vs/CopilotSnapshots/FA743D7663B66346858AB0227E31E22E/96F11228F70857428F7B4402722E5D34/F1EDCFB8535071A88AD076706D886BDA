using EVChargingSystem.Api.DTOs;
using EVChargingSystem.Api.Entities;
using EVChargingSystem.Api.Repositories;
using MongoDB.Driver;

namespace EVChargingSystem.Api.Services
{
    public class ChargingStationService : IChargingStationService
    {
        private readonly MongoDbContext _context;
        private readonly IGoogleMapsService _mapsService;
        private readonly IBookingService _bookingService;

        public ChargingStationService(MongoDbContext context, IGoogleMapsService mapsService, IBookingService bookingService)
        {
            _context = context;
            _mapsService = mapsService;
            _bookingService = bookingService;
        }

        public async Task<ChargingStationDto> CreateChargingStation(ChargingStationDto dto)
        {
            var (lat, lng) = await _mapsService.GeocodeAddress(dto.Address);

            var station = new ChargingStation
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Address = dto.Address,
                Latitude = lat,
                Longitude = lng,
                Type = dto.Type,
                AvailableSlots = dto.AvailableSlots,
                Schedule = dto.Schedule,
                IsActive = true
            };

            await _context.ChargingStations.InsertOneAsync(station);

            dto.Id = station.Id;
            dto.Latitude = lat;
            dto.Longitude = lng;
            dto.IsActive = true;
            return dto;
        }

        public async Task<ChargingStationDto> UpdateChargingStation(Guid id, ChargingStationDto dto)
        {
            var station = await _context.ChargingStations.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (station == null) throw new Exception("Charging station not found");

            var (lat, lng) = await _mapsService.GeocodeAddress(dto.Address);

            var update = Builders<ChargingStation>.Update
                .Set(s => s.Name, dto.Name)
                .Set(s => s.Address, dto.Address)
                .Set(s => s.Latitude, lat)
                .Set(s => s.Longitude, lng)
                .Set(s => s.Type, dto.Type)
                .Set(s => s.AvailableSlots, dto.AvailableSlots)
                .Set(s => s.Schedule, dto.Schedule);

            await _context.ChargingStations.UpdateOneAsync(s => s.Id == id, update);

            dto.Id = id;
            dto.Latitude = lat;
            dto.Longitude = lng;
            dto.IsActive = station.IsActive;
            return dto;
        }

        public async Task DeactivateChargingStation(Guid id)
        {
            var station = await _context.ChargingStations.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (station == null) throw new Exception("Charging station not found");

            // Check if there are active bookings for this station
            var hasActiveBookings = await _bookingService.HasActiveBookingsForStation(id);
            if (hasActiveBookings)
                throw new Exception("Cannot deactivate charging station with active bookings");

            var update = Builders<ChargingStation>.Update.Set(s => s.IsActive, false);
            await _context.ChargingStations.UpdateOneAsync(s => s.Id == id, update);
        }

        public async Task<IEnumerable<ChargingStationDto>> GetAllChargingStations()
        {
            var stations = await _context.ChargingStations.Find(_ => true).ToListAsync();

            return stations.Select(s => new ChargingStationDto
            {
                Id = s.Id,
                Name = s.Name,
                Address = s.Address,
                Latitude = s.Latitude,
                Longitude = s.Longitude,
                Type = s.Type,
                AvailableSlots = s.AvailableSlots,
                Schedule = s.Schedule,
                IsActive = s.IsActive
            });
        }

        public async Task<ChargingStationDto> GetChargingStationById(Guid id)
        {
            var station = await _context.ChargingStations.Find(s => s.Id == id).FirstOrDefaultAsync();
            if (station == null) throw new Exception("Charging station not found");

            return new ChargingStationDto
            {
                Id = station.Id,
                Name = station.Name,
                Address = station.Address,
                Latitude = station.Latitude,
                Longitude = station.Longitude,
                Type = station.Type,
                AvailableSlots = station.AvailableSlots,
                Schedule = station.Schedule,
                IsActive = station.IsActive
            };
        }

        public async Task<IEnumerable<ChargingStationDto>> GetActiveChargingStations()
        {
            var stations = await _context.ChargingStations.Find(s => s.IsActive).ToListAsync();

            return stations.Select(s => new ChargingStationDto
            {
                Id = s.Id,
                Name = s.Name,
                Address = s.Address,
                Latitude = s.Latitude,
                Longitude = s.Longitude,
                Type = s.Type,
                AvailableSlots = s.AvailableSlots,
                Schedule = s.Schedule,
                IsActive = s.IsActive
            });
        }
    }
}