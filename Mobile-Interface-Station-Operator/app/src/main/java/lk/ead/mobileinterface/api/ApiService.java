package lk.ead.mobileinterface.api;


import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.models.StationOperatorLoginRequest;
import lk.ead.mobileinterface.models.StationOperatorLoginResponse;
import lk.ead.mobileinterface.models.Station;

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

    // Login as operator
    @POST("api/Auth/login")
    Call<StationOperatorLoginResponse> operatorLogin(@Body StationOperatorLoginRequest request);

    // -------------------------------------------------------------
    // CHARGING STATIONS
    // -------------------------------------------------------------

    // -------------------------------------------------------------
    // BOOKINGS
    // -------------------------------------------------------------

    // Create new booking
    @POST("api/Bookings")
    Call<Booking> createBooking(@Header("Authorization") String token, @Body Booking booking);

    @GET("api/Bookings/pending")
    Call<List<Booking>> getPendingBookings(@Header("Authorization") String bearerToken);

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
