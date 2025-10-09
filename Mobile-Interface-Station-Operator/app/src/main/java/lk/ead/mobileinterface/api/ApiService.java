package lk.ead.mobileinterface.api;


import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.models.StationBookingsResponse;
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
    // BOOKINGS
    // -------------------------------------------------------------

    @GET("api/Bookings")
    Call<List<Booking>> getAllBookings(@Header("Authorization") String bearerToken);

    @GET("api/Bookings/station/6c4c5788-aef0-4433-8d69-16a974159615") Call<StationBookingsResponse> getBookingsForMyStation(@Header("Authorization") String bearerToken);

    @GET("api/Bookings/pending")
    Call<List<Booking>> getPendingBookings(@Header("Authorization") String bearerToken);

    // Get all bookings of logged-in user
    @GET("api/Bookings/my-bookings")
    Call<List<Booking>> getMyBookings(@Header("Authorization") String token);

    @GET("api/Bookings/{id}")
    Call<Booking> getBookingById(@Header("Authorization") String bearerToken, @Path("id") String id);

    // Get QR code for approved booking
    @GET("api/Bookings/{id}/qrcode")
    Call<Booking> getBookingQRCode(@Header("Authorization") String token, @Path("id") int bookingId);


    @POST("api/Bookings/validate-qr")
    Call<Booking> validateQR(@Header("Authorization") String bearerToken, @Body String qrCode); // API expects raw string

}
