using EVChargingAPI.DTOs;
using EVChargingAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EVChargingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // any authenticated; but restrict actions where needed
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;
        public UserController(UserService s) => _userService = s;

        // Only backoffice can list/create/manage users: enforce via policy in Program.cs or check claim
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var role = User.FindFirst("role")?.Value;
            if (role != "Backoffice") return Forbid();

            var users = await _userService.GetAllAsync();
            var result = users.Select(u => new { u.Id, u.Username, u.Role, u.IsBackoffice, u.IsStationOperator });
            return Ok(result);
        }
    }
}
