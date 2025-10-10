using GoogleMaps.LocationServices;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace EVChargingSystem.Api.Services
{
    public class GoogleMapsService : IGoogleMapsService
    {
        private readonly string _apiKey;
        private readonly GoogleLocationService _locationService;
        private readonly HttpClient _httpClient;

        public GoogleMapsService(IConfiguration configuration, HttpClient httpClient)
        {
            _apiKey = configuration["GoogleMaps:ApiKey"] ?? throw new ArgumentNullException(nameof(configuration), "Google Maps API key is missing in configuration.");
            _locationService = new GoogleLocationService(_apiKey);
            _httpClient = httpClient;
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

        public async Task<string> ReverseGeocode(double latitude, double longitude)
        {
            try
            {
                if (!IsValidCoordinate(latitude, longitude))
                    throw new ArgumentException("Invalid latitude or longitude values.");

                var url = $"https://maps.googleapis.com/maps/api/geocode/json?latlng={latitude},{longitude}&key={_apiKey}";
                
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<GoogleGeocodingResponse>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                if (result?.Status == "OK" && result.Results?.Length > 0)
                {
                    return result.Results[0].FormattedAddress;
                }
                
                throw new InvalidOperationException($"Address not found or invalid response from Google Maps API. Status: {result?.Status}, Error: {result?.ErrorMessage}");
            }
            catch (Exception ex) when (!(ex is InvalidOperationException) && !(ex is ArgumentException))
            {
                throw new InvalidOperationException($"Reverse geocoding failed: {ex.Message}", ex);
            }
        }

        public async Task<bool> ValidateCoordinates(double latitude, double longitude)
        {
            try
            {
                if (!IsValidCoordinate(latitude, longitude))
                    return false;

                var url = $"https://maps.googleapis.com/maps/api/geocode/json?latlng={latitude},{longitude}&key={_apiKey}";
                
                var response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                
                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<GoogleGeocodingResponse>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                return result?.Status == "OK" && result.Results?.Length > 0;
            }
            catch
            {
                return false;
            }
        }

        private static bool IsValidCoordinate(double latitude, double longitude)
        {
            return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
        }
    }

    // Response models for Google Maps API
    public class GoogleGeocodingResponse
    {
        public string Status { get; set; }
        public GoogleGeocodingResult[] Results { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class GoogleGeocodingResult
    {
        public string FormattedAddress { get; set; }
        public GoogleGeometry Geometry { get; set; }
    }

    public class GoogleGeometry
    {
        public GoogleLocation Location { get; set; }
    }

    public class GoogleLocation
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }
}