using EVChargingSystem.Api.DTOs;
using EVChargingSystem.Api.Entities;
using EVChargingSystem.Api.Repositories;
using MongoDB.Driver;

namespace EVChargingSystem.Api.Services
{
    public class BookingService : IBookingService
    {
        private readonly MongoDbContext _context;
        private readonly IQRCodeService _qrCodeService;

        public BookingService(MongoDbContext context, IQRCodeService qrCodeService)
        {
            _context = context;
            _qrCodeService = qrCodeService;
        }

        public async Task<BookingSummaryDto> GetBookingSummary(BookingDto dto)
        {
            // Get EV Owner details
            var evOwner = await _context.EVOwners.Find(o => o.NIC == dto.EVOwnerNIC).FirstOrDefaultAsync();
            if (evOwner == null || !evOwner.IsActive)
                throw new Exception("EV Owner not found or inactive");

            // Get charging station details
            var station = await _context.ChargingStations.Find(s => s.Id == dto.ChargingStationId).FirstOrDefaultAsync();
            if (station == null || !station.IsActive)
                throw new Exception("Charging station not found or inactive");

            return new BookingSummaryDto
            {
                BookingId = Guid.NewGuid(), // Will be assigned on creation
                EVOwnerName = evOwner.Name,
                EVOwnerNIC = evOwner.NIC,
                ChargingStationName = station.Name,
                ChargingStationAddress = station.Address,
                ReservationDateTime = dto.ReservationDateTime,
                EstimatedDuration = "2 hours",
                EstimatedCost = 500.00m
            };
        }

        public async Task<BookingDto> CreateBooking(BookingDto dto)
        {
            // Validate reservation is within 7 days
            if (dto.ReservationDateTime > DateTime.UtcNow.AddDays(7))
                throw new Exception("Reservation must be within 7 days from booking date");

            if (dto.ReservationDateTime <= DateTime.UtcNow)
                throw new Exception("Reservation must be in the future");

            // Check if EV Owner exists and is active
            var evOwner = await _context.EVOwners.Find(o => o.NIC == dto.EVOwnerNIC).FirstOrDefaultAsync();
            if (evOwner == null || !evOwner.IsActive)
                throw new Exception("EV Owner not found or inactive");

            // Check if charging station exists and is active
            var station = await _context.ChargingStations.Find(s => s.Id == dto.ChargingStationId).FirstOrDefaultAsync();
            if (station == null || !station.IsActive)
                throw new Exception("Charging station not found or inactive");

            // Check availability (simplified - could be enhanced with slot management)
            var existingBookingsCount = await _context.Bookings
                .CountDocumentsAsync(b => b.ChargingStationId == dto.ChargingStationId && 
                                         b.IsActive && 
                                         b.Status != BookingStatus.Cancelled &&
                                         b.ReservationDateTime.Date == dto.ReservationDateTime.Date);

            if (existingBookingsCount >= station.AvailableSlots)
                throw new Exception("No available slots for the selected date and time");

            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                EVOwnerNIC = dto.EVOwnerNIC,
                ChargingStationId = dto.ChargingStationId,
                BookingDate = DateTime.UtcNow,
                ReservationDateTime = dto.ReservationDateTime,
                Status = BookingStatus.Pending,
                IsActive = true
            };

            await _context.Bookings.InsertOneAsync(booking);

            return MapToDto(booking);
        }

        public async Task<BookingDto> ApproveBooking(Guid bookingId, string approvedBy)
        {
            var booking = await _context.Bookings.Find(b => b.Id == bookingId).FirstOrDefaultAsync();
            if (booking == null || !booking.IsActive)
                throw new Exception("Booking not found or inactive");

            if (booking.Status != BookingStatus.Pending)
                throw new Exception("Only pending bookings can be approved");

            // Generate QR code when approved
            var qrCode = await _qrCodeService.GenerateQRCodeForBooking(bookingId);

            var update = Builders<Booking>.Update
                .Set(b => b.Status, BookingStatus.Approved)
                .Set(b => b.ApprovedBy, approvedBy)
                .Set(b => b.ApprovedAt, DateTime.UtcNow)
                .Set(b => b.QRCode, qrCode);

            await _context.Bookings.UpdateOneAsync(b => b.Id == bookingId, update);

            booking.Status = BookingStatus.Approved;
            booking.ApprovedBy = approvedBy;
            booking.ApprovedAt = DateTime.UtcNow;
            booking.QRCode = qrCode;

            return MapToDto(booking);
        }

        public async Task<BookingDto> RejectBooking(Guid bookingId, string rejectedBy, string reason)
        {
            var booking = await _context.Bookings.Find(b => b.Id == bookingId).FirstOrDefaultAsync();
            if (booking == null || !booking.IsActive)
                throw new Exception("Booking not found or inactive");

            if (booking.Status != BookingStatus.Pending)
                throw new Exception("Only pending bookings can be rejected");

            var update = Builders<Booking>.Update
                .Set(b => b.Status, BookingStatus.Rejected)
                .Set(b => b.ApprovedBy, rejectedBy)
                .Set(b => b.ApprovedAt, DateTime.UtcNow)
                .Set(b => b.RejectionReason, reason);

            await _context.Bookings.UpdateOneAsync(b => b.Id == bookingId, update);

            booking.Status = BookingStatus.Rejected;
            booking.ApprovedBy = rejectedBy;
            booking.ApprovedAt = DateTime.UtcNow;
            booking.RejectionReason = reason;

            return MapToDto(booking);
        }

        public async Task<IEnumerable<BookingDto>> GetPendingBookings()
        {
            var bookings = await _context.Bookings
                .Find(b => b.Status == BookingStatus.Pending && b.IsActive)
                .ToListAsync();

            return bookings.Select(MapToDto);
        }

        public async Task<string> GenerateQRCodeForBooking(Guid bookingId)
        {
            var booking = await _context.Bookings.Find(b => b.Id == bookingId).FirstOrDefaultAsync();
            if (booking == null || booking.Status != BookingStatus.Approved)
                throw new Exception("Booking not found or not approved");

            return await _qrCodeService.GenerateQRCodeForBooking(bookingId);
        }

        public async Task<BookingQRData?> ValidateQRCode(string qrCodeData)
        {
            return await _qrCodeService.ValidateQRCode(qrCodeData);
        }

        public async Task<IEnumerable<BookingDto>> GetUpcomingBookingsByEVOwner(string evOwnerNIC)
        {
            var bookings = await _context.Bookings
                .Find(b => b.EVOwnerNIC == evOwnerNIC && 
                          b.IsActive && 
                          b.ReservationDateTime > DateTime.UtcNow)
                .SortBy(b => b.ReservationDateTime)
                .ToListAsync();

            return bookings.Select(MapToDto);
        }

        public async Task<IEnumerable<BookingDto>> GetPastBookingsByEVOwner(string evOwnerNIC)
        {
            var bookings = await _context.Bookings
                .Find(b => b.EVOwnerNIC == evOwnerNIC && 
                          (b.ReservationDateTime < DateTime.UtcNow || 
                           b.Status == BookingStatus.Completed ||
                           b.Status == BookingStatus.Cancelled))
                .SortByDescending(b => b.ReservationDateTime)
                .ToListAsync();

            return bookings.Select(MapToDto);
        }

        // Existing methods with updates
        public async Task<BookingDto> UpdateBooking(Guid id, BookingDto dto)
        {
            var booking = await _context.Bookings.Find(b => b.Id == id && b.IsActive).FirstOrDefaultAsync();
            if (booking == null) throw new Exception("Booking not found or already cancelled");

            if (booking.Status != BookingStatus.Pending)
                throw new Exception("Only pending bookings can be updated");

            // Check 12-hour rule
            if (booking.ReservationDateTime.Subtract(DateTime.UtcNow).TotalHours < 12)
                throw new Exception("Cannot update booking less than 12 hours before reservation");

            // Validate new reservation time
            if (dto.ReservationDateTime > DateTime.UtcNow.AddDays(7))
                throw new Exception("Reservation must be within 7 days from today");

            if (dto.ReservationDateTime <= DateTime.UtcNow)
                throw new Exception("Reservation must be in the future");

            var update = Builders<Booking>.Update.Set(b => b.ReservationDateTime, dto.ReservationDateTime);
            await _context.Bookings.UpdateOneAsync(b => b.Id == id, update);
            
            booking.ReservationDateTime = dto.ReservationDateTime;
            return MapToDto(booking);
        }

        public async Task CancelBooking(Guid id)
        {
            var booking = await _context.Bookings.Find(b => b.Id == id && b.IsActive).FirstOrDefaultAsync();
            if (booking == null) throw new Exception("Booking not found or already cancelled");

            // Check 12-hour rule
            if (booking.ReservationDateTime.Subtract(DateTime.UtcNow).TotalHours < 12)
                throw new Exception("Cannot cancel booking less than 12 hours before reservation");

            var update = Builders<Booking>.Update
                .Set(b => b.Status, BookingStatus.Cancelled)
                .Set(b => b.IsActive, false);
            
            await _context.Bookings.UpdateOneAsync(b => b.Id == id, update);
        }

        public async Task<IEnumerable<BookingDto>> GetBookingsByEVOwner(string evOwnerNIC)
        {
            var bookings = await _context.Bookings
                .Find(b => b.EVOwnerNIC == evOwnerNIC)
                .SortByDescending(b => b.BookingDate)
                .ToListAsync();

            return bookings.Select(MapToDto);
        }

        public async Task<IEnumerable<BookingDto>> GetAllBookings()
        {
            var bookings = await _context.Bookings.Find(_ => true).ToListAsync();
            return bookings.Select(MapToDto);
        }

        public async Task<BookingDto> GetBookingById(Guid id)
        {
            var booking = await _context.Bookings.Find(b => b.Id == id).FirstOrDefaultAsync();
            if (booking == null) throw new Exception("Booking not found");

            return MapToDto(booking);
        }

        public async Task<bool> HasActiveBookingsForStation(Guid stationId)
        {
            return await _context.Bookings
                .Find(b => b.ChargingStationId == stationId && 
                          b.IsActive && 
                          b.Status != BookingStatus.Cancelled &&
                          b.Status != BookingStatus.Completed)
                .AnyAsync();
        }

        private static BookingDto MapToDto(Booking booking)
        {
            return new BookingDto
            {
                Id = booking.Id,
                EVOwnerNIC = booking.EVOwnerNIC,
                ChargingStationId = booking.ChargingStationId,
                BookingDate = booking.BookingDate,
                ReservationDateTime = booking.ReservationDateTime,
                Status = booking.Status,
                IsActive = booking.IsActive,
                QRCode = booking.QRCode,
                ApprovedBy = booking.ApprovedBy,
                ApprovedAt = booking.ApprovedAt,
                RejectionReason = booking.RejectionReason
            };
        }
    }
}