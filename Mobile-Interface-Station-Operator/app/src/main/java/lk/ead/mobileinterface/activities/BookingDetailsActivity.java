package lk.ead.mobileinterface.activities;

import static android.content.Intent.getIntent;

import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import java.util.HashMap;
import java.util.Map;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookingDetailsActivity extends AppCompatActivity {

    private static final int STATUS_APPROVED  = 1;
    private static final int STATUS_ACTIVE    = 5;
    private static final int STATUS_COMPLETED = 3;

    private TextView tvStatus, tvBookingId, tvNic, tvTime;
    private Button btnStart, btnComplete;
    private ApiService api;
    private Booking booking;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_details);

        tvStatus = findViewById(R.id.tvStatus);
        tvBookingId = findViewById(R.id.tvBookingId);
        tvNic = findViewById(R.id.tvNic);
        tvTime = findViewById(R.id.tvTime);
        btnStart = findViewById(R.id.btnStart);
        btnComplete = findViewById(R.id.btnComplete);

        api = ApiClient.getClient().create(ApiService.class);

        String id = getIntent().getStringExtra("booking_id");
        if (id == null) { finish(); return; }

        fetchBooking(id);

        btnStart.setOnClickListener(v -> changeStatus(id, STATUS_ACTIVE, "Started by operator"));
        btnComplete.setOnClickListener(v -> changeStatus(id, STATUS_COMPLETED, "Completed by operator"));
    }

    private void fetchBooking(String id) {
        String token = new SessionManager(this).getToken();
        if (token == null) return;

        api.getBookingById("Bearer " + token, id)
                .enqueue(new Callback<Booking>() {
                    @Override
                    public void onResponse(Call<Booking> call, Response<Booking> resp) {
                        if (resp.isSuccessful() && resp.body() != null) {
                            booking = resp.body();
                            bind(booking);
                        } else {
                            Toast.makeText(BookingDetailsActivity.this, "Failed to load booking", Toast.LENGTH_SHORT).show();
                        }
                    }
                    @Override public void onFailure(Call<Booking> call, Throwable t) {
                        Toast.makeText(BookingDetailsActivity.this, "Network error", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void bind(Booking b) {
        tvBookingId.setText("Booking ID: " + b.getId());
        tvNic.setText("EV Owner NIC: " + b.getEvOwnerNic());
        tvTime.setText("Reservation: " + b.getReservationDateTime());
        tvStatus.setText("Status: " + statusText(b.getStatus()));

        btnStart.setEnabled(b.getStatus() == STATUS_APPROVED);
        btnComplete.setEnabled(b.getStatus() == STATUS_ACTIVE);
    }

    private void changeStatus(String id, int newStatus, String reason) {
        String token = new SessionManager(this).getToken();
        if (token == null) return;

        Map<String, Object> body = new HashMap<>();
        body.put("newStatus", newStatus);
        body.put("reason", reason);

        api.changeBookingStatus("Bearer " + token, id, body)
                .enqueue(new Callback<Map<String, Object>>() {
                    @Override
                    public void onResponse(Call<Map<String, Object>> call, Response<Map<String, Object>> resp) {
                        if (resp.isSuccessful()) {
                            Toast.makeText(BookingDetailsActivity.this, "Status updated!", Toast.LENGTH_SHORT).show();
                            fetchBooking(id); // reload data
                        } else {
                            Toast.makeText(BookingDetailsActivity.this, "Failed to update", Toast.LENGTH_SHORT).show();
                        }
                    }
                    @Override
                    public void onFailure(Call<Map<String, Object>> call, Throwable t) {
                        Toast.makeText(BookingDetailsActivity.this, "Network error", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private String statusText(int s) {
        switch (s) {
            case 1: return "Approved";
            case 3: return "Completed";
            case 5: return "Active";
            default: return "Unknown";
        }
    }
}