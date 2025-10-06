using Microsoft.AspNetCore.Authorization;
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