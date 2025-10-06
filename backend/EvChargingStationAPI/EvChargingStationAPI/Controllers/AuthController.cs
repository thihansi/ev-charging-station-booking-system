using EVChargingAPI.DTOs;
using EVChargingAPI.Models;
using EVChargingAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace EVChargingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly EVOwnerService _ownerService;
        private readonly AuthService _authService;

        public AuthController(UserService userService, EVOwnerService ownerService, AuthService authService)
        {
            _userService = userService;
            _ownerService = ownerService;
            _authService = authService;
        }

        // Register web user
        [HttpPost("register-user")]
        public async Task<IActionResult> RegisterUser([FromBody] UserRegisterDto dto)
        {
            var exists = await _userService.GetByUsernameAsync(dto.Username);
            if (exists != null) return Conflict(new { message = "Username already exists" });

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                IsBackoffice = dto.IsBackoffice,
                IsStationOperator = dto.IsStationOperator,
                Role = dto.IsBackoffice ? "Backoffice" : (dto.IsStationOperator ? "StationOperator" : "User")
            };

            await _userService.CreateAsync(user);
            return Created("", new { message = "User created" });
        }

        // Login web user
        [HttpPost("login-user")]
        public async Task<IActionResult> LoginUser([FromBody] UserLoginDto dto)
        {
            var user = await _userService.GetByUsernameAsync(dto.Username);
            if (user == null) return Unauthorized(new { message = "Invalid credentials" });

            bool ok = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!ok) return Unauthorized(new { message = "Invalid credentials" });

            var token = _authService.GenerateTokenForUser(user);
            return Ok(new LoginResponseDto { Token = token, ExpiresInMinutes = _authService.GetExpiryMinutes(), User = new { user.Username, user.Role, user.IsBackoffice, user.IsStationOperator } });
        }

        // Register EV owner (mobile side)
        [HttpPost("register-owner")]
        public async Task<IActionResult> RegisterOwner([FromBody] RegisterEVOwnerDto dto)
        {
            if (await _ownerService.ExistsAsync(dto.NIC))
                return Conflict(new { message = "NIC already registered" });

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
            return Created("", new { message = "Owner registered" });
        }

        // Login EV owner (mobile)
        [HttpPost("login-owner")]
        public async Task<IActionResult> LoginOwner([FromBody] DTOs.UserLoginDto dto) // reuse simple dto: username=NIC, password=Password
        {
            // username -> NIC
            var owner = await _ownerService.ValidateCredentialsAsync(dto.Username, dto.Password);
            if (owner == null) return Unauthorized(new { message = "Invalid credentials or inactive" });

            var token = _authService.GenerateTokenForEVOwner(owner);
            return Ok(new LoginResponseDto { Token = token, ExpiresInMinutes = _authService.GetExpiryMinutes(), User = new { owner.NIC, owner.Name, owner.IsActive } });
        }
    }
}
