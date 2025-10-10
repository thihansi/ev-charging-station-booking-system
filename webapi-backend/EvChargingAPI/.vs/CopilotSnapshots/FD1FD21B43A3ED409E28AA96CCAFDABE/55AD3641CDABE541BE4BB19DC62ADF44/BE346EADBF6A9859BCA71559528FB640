using EVChargingSystem.Api.DTOs;
using EVChargingSystem.Api.Entities;
using EVChargingSystem.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EVChargingSystem.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        [Authorize(Policy = "BackofficeOnly")]  // Only Backoffice can create users
        public async Task<IActionResult> Register([FromQuery] string username, [FromQuery] string password, [FromQuery] Role role)
        {
            try
            {
                var user = await _userService.CreateUser(username, password, role);
                return Ok(new SystemUserResponseDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role,
                    Message = "User created successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("create-backoffice-user")]
        public async Task<IActionResult> CreateBackofficeUser([FromBody] CreateBackofficeUserDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
                {
                    return BadRequest("Username and Password are required");
                }

                if (dto.Password.Length < 6)
                {
                    return BadRequest("Password must be at least 6 characters long");
                }

                var user = await _userService.CreateUser(dto.Username, dto.Password, Role.Backoffice);
                
                return Ok(new SystemUserResponseDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role,
                    Message = "Backoffice user created successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("create-station-operator")]
        public async Task<IActionResult> CreateStationOperator([FromBody] CreateStationOperatorDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
                {
                    return BadRequest("Username and Password are required");
                }

                if (dto.Password.Length < 6)
                {
                    return BadRequest("Password must be at least 6 characters long");
                }

                var user = await _userService.CreateUser(dto.Username, dto.Password, Role.StationOperator);
                
                return Ok(new SystemUserResponseDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Role = user.Role,
                    Message = "Station Operator created successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
                {
                    return BadRequest("Username and Password are required");
                }

                var token = await _userService.Authenticate(dto.Username, dto.Password);
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { Message = ex.Message });
            }
        }

        [HttpGet("profile")]
        [Authorize]
        public IActionResult GetProfile()
        {
            try
            {
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(role))
                {
                    return Unauthorized("Invalid token");
                }

                return Ok(new 
                { 
                    Username = username,
                    Role = role,
                    Message = "Profile retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("users")]
        [Authorize(Policy = "BackofficeOnly")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsers();
                return Ok(new { 
                    Message = "Users retrieved successfully", 
                    Count = users.Count(),
                    Users = users 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("users/{id}")]
        [Authorize(Policy = "BackofficeOnly")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            try
            {
                var user = await _userService.GetUserById(id);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return NotFound(new { Message = ex.Message });
            }
        }

        [HttpPut("users/{id}")]
        [Authorize(Policy = "BackofficeOnly")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Username))
                {
                    return BadRequest("Username is required");
                }

                var updatedUser = await _userService.UpdateUser(id, dto);
                return Ok(new { 
                    Message = "User updated successfully", 
                    User = updatedUser 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("users/{id}")]
        [Authorize(Policy = "BackofficeOnly")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            try
            {
                await _userService.DeleteUser(id);
                return Ok(new { Message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}