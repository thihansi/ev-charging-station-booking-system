using EVChargingSystem.Api.DTOs;
using EVChargingSystem.Api.Entities;

namespace EVChargingSystem.Api.Services
{
    public interface IUserService
    {
        Task<UserDto> CreateUser(string username, string password, Role role);
        Task<string> Authenticate(string username, string password);
        Task<IEnumerable<UserDto>> GetAllUsers();
        Task<UserDto> GetUserById(Guid id);
        Task<UserDto> UpdateUser(Guid id, UpdateUserDto dto);
        Task DeleteUser(Guid id);
    }
}