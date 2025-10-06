using EVChargingAPI.DTOs;
using EVChargingAPI.Models;
using EVChargingAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EVChargingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationController : ControllerBase
    {
        private readonly ReservationService _reservationService;
        private readonly EVOwnerService _ownerService;
        private readonly StationService _stationService;

        public ReservationController(ReservationService resService, EVOwnerService ownerService, StationService stationService)
        {
            _reservationService = resService;
            _ownerService = ownerService;
            _stationService = stationService;
        }

        // Create reservation - must be within 7 days from now
        [HttpPost]
        [Authorize] // owner or any client; we validate claims
        public async Task<IActionResult> Create([FromBody] ReservationCreateDto dto)
        {
            // Validate owner exists and active
            var owner = await _ownerService.GetByNicAsync(dto.OwnerNIC);
            if (owner == null || !owner.IsActive) return BadRequest(new { message = "Invalid or inactive owner" });

            // Validate station active
            var station = await _stationService.GetByIdAsync(dto.StationId);
            if (station == null || !station.IsActive) return BadRequest(new { message = "Invalid or inactive station" });

            var now = DateTime.UtcNow;
            var maxDate = now.AddDays(7);
            if (dto.ReservationDateTimeUtc < now || dto.ReservationDateTimeUtc > maxDate)
                return BadRequest(new { message = "Reservation must be within the next 7 days" });

            // Optionally check slot availability: (basic check: ensure availableSlots > active bookings)
            var activeBookings = await _reservationService.GetActiveReservationsForStationAsync(dto.StationId);
            if (activeBookings.Count >= station.AvailableSlots) return BadRequest(new { message = "No available slots at chosen time" });

            var reservation = new Reservation
            {
                OwnerNIC = dto.OwnerNIC,
                StationId = dto.StationId,
                ReservationDateTimeUtc = dto.ReservationDateTimeUtc,
                Status = "Pending",
                CreatedAtUtc = DateTime.UtcNow
            };

            await _reservationService.CreateAsync(reservation);
            return Created("", new ReservationDto { Id = reservation.Id, OwnerNIC = reservation.OwnerNIC, StationId = reservation.StationId, ReservationDateTimeUtc = reservation.ReservationDateTimeUtc, Status = reservation.Status, CreatedAtUtc = reservation.CreatedAtUtc });
        }

        // Update reservation - at least 12 hours before reservation
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(string id, [FromBody] ReservationUpdateDto dto)
        {
            var reservation = await _reservationService.GetByIdAsync(id);
            if (reservation == null) return NotFound();

            var now = DateTime.UtcNow;
            if ((reservation.ReservationDateTimeUtc - now).TotalHours < 12)
                return BadRequest(new { message = "Cannot update reservation less than 12 hours before" });

            var newTime = dto.ReservationDateTimeUtc;
            // Must be within 7 days of now
            if (newTime < now || newTime > now.AddDays(7))
                return BadRequest(new { message = "New reservation time must be within next 7 days" });

            reservation.ReservationDateTimeUtc = newTime;
            await _reservationService.UpdateAsync(id, reservation);
            return Ok(new ReservationDto { Id = reservation.Id, OwnerNIC = reservation.OwnerNIC, StationId = reservation.StationId, ReservationDateTimeUtc = reservation.ReservationDateTimeUtc, Status = reservation.Status, CreatedAtUtc = reservation.CreatedAtUtc });
        }

        // Cancel reservation - at least 12 hours before reservation
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Cancel(string id)
        {
            var reservation = await _reservationService.GetByIdAsync(id);
            if (reservation == null) return NotFound();

            var now = DateTime.UtcNow;
            if ((reservation.ReservationDateTimeUtc - now).TotalHours < 12)
                return BadRequest(new { message = "Cannot cancel reservation less than 12 hours before" });

            reservation.Status = "Cancelled";
            await _reservationService.UpdateAsync(id, reservation);
            return Ok(new { message = "Cancelled" });
        }

        // Get reservations for owner
        [HttpGet("owner/{nic}")]
        [Authorize]
        public async Task<IActionResult> GetForOwner(string nic)
        {
            var role = User.FindFirst("role")?.Value;
            var requester = User.Identity?.Name;

            if (role == "EVOwner" && requester != nic) return Forbid();
            // Backoffice and StationOperator can view any owner reservations
            var list = await _reservationService.GetByOwnerAsync(nic);
            var dto = list.Select(r => new ReservationDto { Id = r.Id, OwnerNIC = r.OwnerNIC, StationId = r.StationId, ReservationDateTimeUtc = r.ReservationDateTimeUtc, Status = r.Status, CreatedAtUtc = r.CreatedAtUtc });
            return Ok(dto);
        }
    }
}
