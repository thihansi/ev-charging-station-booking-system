using EVChargingSystem.Api.DTOs;
using EVChargingSystem.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvChargingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChargingStationsController : ControllerBase
    {
        private readonly IChargingStationService _service;

        public ChargingStationsController(IChargingStationService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize(Policy = "BackofficeOnly")]
        public async Task<IActionResult> CreateChargingStation([FromBody] ChargingStationDto dto)
        {
            try
            {
                var result = await _service.CreateChargingStation(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Backoffice,StationOperator")]
        public async Task<IActionResult> UpdateChargingStation(Guid id, [FromBody] ChargingStationDto dto)
        {
            try
            {
                var result = await _service.UpdateChargingStation(id, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "BackofficeOnly")]
        public async Task<IActionResult> DeactivateChargingStation(Guid id)
        {
            try
            {
                await _service.DeactivateChargingStation(id);
                return Ok(new { Message = "Charging station deactivated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet]
        [AllowAnonymous] // Public endpoint for finding charging stations
        public async Task<IActionResult> GetAllChargingStations()
        {
            try
            {
                var stations = await _service.GetAllChargingStations();
                return Ok(stations);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("active")]
        [AllowAnonymous] // Public endpoint for finding active charging stations
        public async Task<IActionResult> GetActiveChargingStations()
        {
            try
            {
                var stations = await _service.GetActiveChargingStations();
                return Ok(stations);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous] // Public endpoint for station details
        public async Task<IActionResult> GetChargingStationById(Guid id)
        {
            try
            {
                var station = await _service.GetChargingStationById(id);
                return Ok(station);
            }
            catch (Exception ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }
    }
}