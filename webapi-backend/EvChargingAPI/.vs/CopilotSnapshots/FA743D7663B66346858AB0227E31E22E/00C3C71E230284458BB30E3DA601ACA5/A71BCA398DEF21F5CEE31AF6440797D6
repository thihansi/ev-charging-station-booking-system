using GoogleMaps.LocationServices;
using Microsoft.Extensions.Configuration;

namespace EVChargingSystem.Api.Services
{
    public class GoogleMapsService : IGoogleMapsService
    {
        private readonly string _apiKey;
        private readonly GoogleLocationService _locationService;

        public GoogleMapsService(IConfiguration configuration)
        {
            _apiKey = configuration["GoogleMaps:ApiKey"] ?? throw new ArgumentNullException(nameof(configuration), "Google Maps API key is missing in configuration.");
            _locationService = new GoogleLocationService(_apiKey);
        }

        public async Task<(double Latitude, double Longitude)> GeocodeAddress(string address)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(address))
                    throw new ArgumentException("Address cannot be null or empty.", nameof(address));

                var point = await Task.Run(() => _locationService.GetLatLongFromAddress(address));

                if (point != null)
                {
                    return (point.Latitude, point.Longitude);
                }

                throw new InvalidOperationException("Address not found or invalid response from Google Maps API.");
            }
            catch (Exception ex) when (!(ex is InvalidOperationException) && !(ex is ArgumentException))
            {
                throw new InvalidOperationException($"Geocoding failed: {ex.Message}", ex);
            }
        }
    }
}