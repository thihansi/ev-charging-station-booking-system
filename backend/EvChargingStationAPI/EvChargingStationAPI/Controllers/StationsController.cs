using EVChargingAPI.DTOs;
using EVChargingAPI.Models;
using EVChargingAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EVChargingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationController : ControllerBase
    {
        private readonly StationService _stationService;
        private readonly ReservationService _reservationService;

        public StationController(StationService stationService, ReservationService reservationService)
        {
            _stationService = stationService;
            _reservationService = reservationService;
        }

        // Create station - Backoffice only
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] StationCreateDto dto)
        {
            var role = User.FindFirst("role")?.Value;
            if (role != "Backoffice") return Forbid();

            var station = new Station
            {
                Name = dto.Name,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Type = dto.Type,
                AvailableSlots = dto.AvailableSlots,
                IsActive = true
            };

            await _stationService.CreateAsync(station);
            return Created("", new StationDto { Id = station.Id, Name = station.Name, Latitude = station.Latitude, Longitude = station.Longitude, Type = station.Type, AvailableSlots = station.AvailableSlots, IsActive = station.IsActive });
        }

        // Update station - Backoffice only
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(string id, [FromBody] StationUpdateDto dto)
        {
            var role = User.FindFirst("role")?.Value;
            if (role != "Backoffice") return Forbid();

            var station = await _stationService.GetByIdAsync(id);
            if (station == null) return NotFound();

            station.Name = dto.Name;
            station.Latitude = dto.Latitude;
            station.Longitude = dto.Longitude;
            station.Type = dto.Type;
            station.AvailableSlots = dto.AvailableSlots;
            station.IsActive = dto.IsActive;

            await _stationService.UpdateAsync(id, station);
            return Ok(new StationDto { Id = station.Id, Name = station.Name, Latitude = station.Latitude, Longitude = station.Longitude, Type = station.Type, AvailableSlots = station.AvailableSlots, IsActive = station.IsActive });
        }

        // Deactivate station - Backoffice only, cannot if active bookings exist
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Deactivate(string id)
        {
            var role = User.FindFirst("role")?.Value;
            if (role != "Backoffice") return Forbid();

            // check active bookings
            var activeBookings = await _reservationService.GetActiveReservationsForStationAsync(id);
            if (activeBookings.Any()) return BadRequest(new { message = "Cannot deactivate station with active bookings" });

            var ok = await _stationService.DeactivateAsync(id);
            if (!ok) return NotFound();
            return Ok(new { message = "Station deactivated" });
        }

        // Get all stations - public
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var stations = await _stationService.GetAllAsync();
            var dto = stations.Select(s => new StationDto { Id = s.Id, Name = s.Name, Latitude = s.Latitude, Longitude = s.Longitude, Type = s.Type, AvailableSlots = s.AvailableSlots, IsActive = s.IsActive });
            return Ok(dto);
        }
    }
}
