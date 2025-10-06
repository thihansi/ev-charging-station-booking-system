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
    public class EVOwnerController : ControllerBase
    {
        private readonly EVOwnerService _ownerService;

        public EVOwnerController(EVOwnerService ownerService) => _ownerService = ownerService;

        // Backoffice can create new owners via web; mobile register uses AuthController
        [HttpPost]
        [Authorize] // restrict to Backoffice only
        public async Task<IActionResult> Create([FromBody] RegisterEVOwnerDto dto)
        {
            var role = User.FindFirst("role")?.Value;
            if (role != "Backoffice") return Forbid();

            if (await _ownerService.ExistsAsync(dto.NIC)) return Conflict(new { message = "NIC exists" });

            var owner = new EVOwner
            {
                NIC = dto.NIC,
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsActive = true
            };

            await _ownerService.CreateAsync(owner);
            return Created("", new EVOwnerDto { NIC = owner.NIC, Name = owner.Name, Email = owner.Email, Phone = owner.Phone, IsActive = owner.IsActive });
        }

        // Get all owners - Backoffice only
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var role = User.FindFirst("role")?.Value;
            if (role != "Backoffice") return Forbid();

            var owners = await _ownerService.GetAllAsync();
            var dto = owners.Select(o => new EVOwnerDto { NIC = o.NIC, Name = o.Name, Email = o.Email, Phone = o.Phone, IsActive = o.IsActive });
            return Ok(dto);
        }

        // Get by NIC - Backoffice or owner self
        [HttpGet("{nic}")]
        [Authorize]
        public async Task<IActionResult> GetByNic(string nic)
        {
            var owner = await _ownerService.GetByNicAsync(nic);
            if (owner == null) return NotFound();

            var role = User.FindFirst("role")?.Value;
            var requester = User.Identity?.Name;

            // Owner self can fetch (EVOwner token: Name claim = NIC), Backoffice can fetch
            if (role == "EVOwner" && requester != nic) return Forbid();
            if (role != "EVOwner" && role != "Backoffice" && role != "StationOperator") return Forbid();

            return Ok(new EVOwnerDto { NIC = owner.NIC, Name = owner.Name, Email = owner.Email, Phone = owner.Phone, IsActive = owner.IsActive });
        }

        // Update owner - Backoffice or owner self (owner can't change NIC)
        [HttpPut("{nic}")]
        [Authorize]
        public async Task<IActionResult> Update(string nic, [FromBody] UpdateEVOwnerDto dto)
        {
            var owner = await _ownerService.GetByNicAsync(nic);
            if (owner == null) return NotFound();

            var role = User.FindFirst("role")?.Value;
            var requester = User.Identity?.Name;
            if (role == "EVOwner" && requester != nic) return Forbid();

            owner.Name = dto.Name;
            owner.Email = dto.Email;
            owner.Phone = dto.Phone;
            owner.IsActive = dto.IsActive;

            await _ownerService.UpdateAsync(nic, owner);
            return Ok(new EVOwnerDto { NIC = owner.NIC, Name = owner.Name, Email = owner.Email, Phone = owner.Phone, IsActive = owner.IsActive });
        }

        // Deactivate (soft delete) - Backoffice only
        [HttpDelete("{nic}")]
        [Authorize]
        public async Task<IActionResult> Deactivate(string nic)
        {
            var role = User.FindFirst("role")?.Value;
            if (role != "Backoffice") return Forbid();

            var ok = await _ownerService.DeactivateAsync(nic);
            if (!ok) return NotFound();
            return Ok(new { message = "Deactivated" });
        }
    }
}
