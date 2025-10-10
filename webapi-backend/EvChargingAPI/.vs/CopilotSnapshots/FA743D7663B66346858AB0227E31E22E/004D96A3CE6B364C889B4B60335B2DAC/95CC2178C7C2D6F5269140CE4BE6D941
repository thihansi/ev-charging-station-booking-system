using EVChargingSystem.Api.DTOs;

namespace EVChargingSystem.Api.Services
{
    public interface IEVOwnerService
    {
        Task<EVOwnerDto> CreateEVOwner(EVOwnerDto dto);
        Task<EVOwnerDto> RegisterEVOwner(EVOwnerRegistrationDto dto);
        Task<EVOwnerLoginResponseDto> AuthenticateEVOwner(EVOwnerLoginDto dto);
        Task<EVOwnerDto> GetEVOwnerByNIC(string nic);
        Task<IEnumerable<EVOwnerDto>> GetAllEVOwners();
        Task<IEnumerable<EVOwnerDto>> GetActiveEVOwners();
        Task<IEnumerable<EVOwnerDto>> GetInactiveEVOwners();
        Task<EVOwnerDto> UpdateEVOwner(string nic, EVOwnerDto dto);
        Task DeleteEVOwner(string nic);
        Task ActivateEVOwner(string nic);
        Task DeactivateEVOwner(string nic);
        
        // Self-management methods
        Task<EVOwnerDto> SelfUpdateProfile(string nic, EVOwnerDto dto);
        Task SelfDeactivateAccount(string nic);
        Task<bool> CanReactivateAccount(string nic);
        Task ReactivateAccount(string nic, string reactivatedBy);
    }
}