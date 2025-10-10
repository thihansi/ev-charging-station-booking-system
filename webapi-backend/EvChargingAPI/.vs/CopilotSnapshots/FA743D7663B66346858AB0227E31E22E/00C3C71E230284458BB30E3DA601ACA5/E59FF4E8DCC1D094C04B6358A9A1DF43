using EVChargingSystem.Api.DTOs;
using EVChargingSystem.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EvChargingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "BackofficeOnly")]  // Backoffice manages EV Owners
    public class EVOwnersController : ControllerBase
    {
        private readonly IEVOwnerService _service;

        public EVOwnersController(IEVOwnerService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] EVOwnerDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.NIC))
                {
                    return BadRequest("NIC is required");
                }

                var result = await _service.CreateEVOwner(dto);
                return Ok(new { Message = "EV Owner created successfully", EVOwner = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("create-with-password")]
        public async Task<IActionResult> CreateEVOwnerWithPassword([FromBody] EVOwnerRegistrationDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.NIC) || string.IsNullOrEmpty(dto.Password))
                {
                    return BadRequest("NIC and Password are required");
                }

                if (dto.Password.Length < 6)
                {
                    return BadRequest("Password must be at least 6 characters long");
                }

                var result = await _service.RegisterEVOwner(dto);
                return Ok(new { Message = "EV Owner created with login credentials successfully", EVOwner = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllEVOwners()
        {
            try
            {
                // This would require adding a GetAllEVOwners method to the service
                // For now, we'll return a placeholder
                return Ok(new { Message = "Feature to be implemented: Get all EV owners" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("{nic}")]
        public async Task<IActionResult> GetEVOwner(string nic)
        {
            try
            {
                var result = await _service.GetEVOwnerByNIC(nic);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpPut("{nic}")]
        public async Task<IActionResult> Update(string nic, [FromBody] EVOwnerDto dto)
        {
            try
            {
                var result = await _service.UpdateEVOwner(nic, dto);
                return Ok(new { Message = "EV Owner updated successfully", EVOwner = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{nic}")]
        public async Task<IActionResult> Delete(string nic)
        {
            try
            {
                await _service.DeleteEVOwner(nic);
                return Ok(new { Message = "EV Owner deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("{nic}/activate")]
        public async Task<IActionResult> Activate(string nic)
        {
            try
            {
                await _service.ActivateEVOwner(nic);
                return Ok(new { Message = "EV Owner activated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("{nic}/deactivate")]
        public async Task<IActionResult> Deactivate(string nic)
        {
            try
            {
                await _service.DeactivateEVOwner(nic);
                return Ok(new { Message = "EV Owner deactivated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("{nic}/reactivate")]
        public async Task<IActionResult> Reactivate(string nic)
        {
            try
            {
                var backofficeUser = User.FindFirst(ClaimTypes.Name)?.Value ?? "backoffice";
                
                var canReactivate = await _service.CanReactivateAccount(nic);
                if (!canReactivate)
                {
                    return BadRequest("Account cannot be reactivated or is already active");
                }

                await _service.ReactivateAccount(nic, backofficeUser);
                return Ok(new { Message = "EV Owner account reactivated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}