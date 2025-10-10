namespace EVChargingSystem.Api.Services
{
    public interface IGoogleMapsService
    {
        Task<(double Latitude, double Longitude)> GeocodeAddress(string address);
        Task<string> ReverseGeocode(double latitude, double longitude);
        Task<bool> ValidateCoordinates(double latitude, double longitude);
    }
}