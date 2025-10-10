using EVChargingSystem.Api.Repositories;
using QRCoder;
using System.Text.Json;
using MongoDB.Driver;

namespace EVChargingSystem.Api.Services
{
    public class QRCodeService : IQRCodeService
    {
        private readonly MongoDbContext _context;

        public QRCodeService(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateQRCodeForBooking(Guid bookingId)
        {
            // Get booking details
            var booking = await _context.Bookings.Find(b => b.Id == bookingId).FirstOrDefaultAsync();
            if (booking == null)
                throw new Exception("Booking not found");

            // Get EV Owner details
            var evOwner = await _context.EVOwners.Find(o => o.NIC == booking.EVOwnerNIC).FirstOrDefaultAsync();
            if (evOwner == null)
                throw new Exception("EV Owner not found");

            // Get Charging Station details
            var station = await _context.ChargingStations.Find(s => s.Id == booking.ChargingStationId).FirstOrDefaultAsync();
            if (station == null)
                throw new Exception("Charging Station not found");

            // Create QR data
            var qrData = new BookingQRData
            {
                BookingId = booking.Id,
                EVOwnerNIC = booking.EVOwnerNIC,
                ChargingStationId = booking.ChargingStationId,
                ReservationDateTime = booking.ReservationDateTime,
                EVOwnerName = evOwner.Name,
                StationName = station.Name
            };

            // Serialize to JSON
            var jsonData = JsonSerializer.Serialize(qrData);

            // Generate QR Code
            using var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(jsonData, QRCodeGenerator.ECCLevel.Q);
            var qrCode = new Base64QRCode(qrCodeData);
            var base64String = qrCode.GetGraphic(20);

            return base64String;
        }

        public async Task<BookingQRData?> ValidateQRCode(string qrCodeData)
        {
            try
            {
                // Deserialize QR code data
                var bookingData = JsonSerializer.Deserialize<BookingQRData>(qrCodeData);
                if (bookingData == null)
                    return null;

                // Validate booking exists and is approved
                var booking = await _context.Bookings.Find(b => b.Id == bookingData.BookingId).FirstOrDefaultAsync();
                if (booking == null || booking.Status != Entities.BookingStatus.Approved || !booking.IsActive)
                    return null;

                // Return validated data
                return bookingData;
            }
            catch
            {
                return null;
            }
        }

        public async Task<Guid?> GetBookingIdFromQRCode(string qrCodeData)
        {
            try
            {
                // Deserialize QR code data
                var bookingData = JsonSerializer.Deserialize<BookingQRData>(qrCodeData);
                if (bookingData == null)
                    return null;

                // Validate booking exists and is approved
                var booking = await _context.Bookings.Find(b => b.Id == bookingData.BookingId).FirstOrDefaultAsync();
                if (booking == null || booking.Status != Entities.BookingStatus.Approved || !booking.IsActive)
                    return null;

                // Return only the booking ID
                return bookingData.BookingId;
            }
            catch
            {
                return null;
            }
        }
    }
}