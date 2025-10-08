using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EVChargingSystem.Api.Services;

namespace EVChargingSystem.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsers();
                return Ok(new { 
                    Count = users.Count,
                    Users = users.Select(u => new {
                        u.Id,
                        u.Username,
                        u.Role,
                        // Don't return password hash for security
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // Add more endpoints if needed for user management beyond register
        [HttpGet("debug")]
        public async Task<IActionResult> DebugUsers()
        {
            try
            {
                var users = await _userService.GetAllUsers();
                return Ok(new { 
                    Message = "Debug endpoint - users in database",
                    TotalUsers = users.Count,
                    Usernames = users.Select(u => u.Username).ToList(),
                    Roles = users.Select(u => new { Username = u.Username, Role = u.Role.ToString() }).ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = $"Error fetching users: {ex.Message}" });
            }
        }
    }
}ft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EVChargingSystem.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "BackofficeOnly")]  // Example, if needed for user management beyond register
    public class UsersController : ControllerBase
    {
        // Add more endpoints if needed for user management
    }
}