package lk.ead.mobileinterface.api;


import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.models.LoginRequest;
import lk.ead.mobileinterface.models.LoginResponse;
import lk.ead.mobileinterface.models.RegisterRequest;
import lk.ead.mobileinterface.models.Station;
import lk.ead.mobileinterface.models.User;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.DELETE;
import retrofit2.http.Path;

public interface ApiService {

    // -------------------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------------------

    // Register a new EV Owner
    @POST("api/EVOwnerAuth/register")
    Call<User> register(@Body RegisterRequest request);

    // Login existing EV Owner
    @POST("api/EVOwnerAuth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    // Get EV Owner Profile (requires token)
    @GET("api/EVOwnerAuth/profile")
    Call<User> getProfile(@Header("Authorization") String token);

    // Update EV Owner Profile
    @PUT("api/EVOwnerAuth/profile")
    Call<User> updateProfile(@Header("Authorization") String token, @Body User user);

    // Deactivate Account
    @POST("api/EVOwnerAuth/deactivate")
    Call<Void> deactivateAccount(@Header("Authorization") String token);

    // -------------------------------------------------------------
    // CHARGING STATIONS
    // -------------------------------------------------------------

    // Get all active charging stations
    @GET("api/ChargingStations/active")
    Call<List<Station>> getActiveStations();

    // Get station by ID
    @GET("api/ChargingStations/{id}")
    Call<Station> getStationById(@Path("id") int id);

    // -------------------------------------------------------------
    // BOOKINGS
    // -------------------------------------------------------------

    // Create new booking
    @POST("api/Bookings")
    Call<Booking> createBooking(@Header("Authorization") String token, @Body Booking booking);

    // Get all bookings of logged-in user
    @GET("api/Bookings/my-bookings")
    Call<List<Booking>> getMyBookings(@Header("Authorization") String token);

    // Get upcoming bookings
    @GET("api/Bookings/my-bookings/upcoming")
    Call<List<Booking>> getUpcomingBookings(@Header("Authorization") String token);

    // Get history bookings
    @GET("api/Bookings/my-bookings/history")
    Call<List<Booking>> getHistoryBookings(@Header("Authorization") String token);

    // Get QR code for approved booking
    @GET("api/Bookings/{id}/qrcode")
    Call<Booking> getBookingQRCode(@Header("Authorization") String token, @Path("id") int bookingId);

    // Update booking (change date/time)
    @PUT("api/Bookings/{id}")
    Call<Booking> updateBooking(@Header("Authorization") String token, @Path("id") int bookingId, @Body Booking booking);

    // Cancel booking
    @DELETE("api/Bookings/{id}")
    Call<Void> cancelBooking(@Header("Authorization") String token, @Path("id") int bookingId);
}
