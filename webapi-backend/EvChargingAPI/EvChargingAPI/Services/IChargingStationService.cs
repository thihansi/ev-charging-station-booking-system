using EVChargingSystem.Api.DTOs;

namespace EVChargingSystem.Api.Services
{
    public interface IChargingStationService
    {
        Task<ChargingStationDto> CreateChargingStation(ChargingStationDto dto);
        Task<ChargingStationDto> UpdateChargingStation(Guid id, ChargingStationDto dto);
        Task DeactivateChargingStation(Guid id);
        Task<IEnumerable<ChargingStationDto>> GetAllChargingStations();
        Task<ChargingStationDto> GetChargingStationById(Guid id);
        Task<IEnumerable<ChargingStationDto>> GetActiveChargingStations();
    }
}