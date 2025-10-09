package lk.ead.mobileinterface.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.adapters.ReservationAdapter;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.db.DBHelper;
import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ReservationListActivity extends AppCompatActivity {

    private RecyclerView recyclerCurrent, recyclerCompleted;
    private TextView tvPendingCount, tvUpcomingCount, tvTitle,
            tvUpcomingHeader, tvCompletedHeader;

    private ReservationAdapter adapterCurrent, adapterCompleted;
    private DBHelper db;
    private ApiService api;
    private String filter; // "active" | "upcoming" | "past" | null

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_reservation_list);

        // Views
        tvTitle = findViewById(R.id.tvTitle);
        tvPendingCount = findViewById(R.id.tvPendingCount);
        tvUpcomingCount = findViewById(R.id.tvUpcomingCount);
        tvUpcomingHeader = findViewById(R.id.tvUpcomingHeader);
        tvCompletedHeader = findViewById(R.id.tvCompletedHeader);
        recyclerCurrent = findViewById(R.id.recyclerCurrent);
        recyclerCompleted = findViewById(R.id.recyclerCompleted);

        recyclerCurrent.setLayoutManager(new LinearLayoutManager(this));
        recyclerCompleted.setLayoutManager(new LinearLayoutManager(this));
        adapterCurrent = new ReservationAdapter(new ArrayList<>());
        adapterCompleted = new ReservationAdapter(new ArrayList<>());
        recyclerCurrent.setAdapter(adapterCurrent);
        recyclerCompleted.setAdapter(adapterCompleted);

        // Read filter from intent (optional)
        filter = getIntent().getStringExtra("filter");
        prepareUiForFilter(filter);

        // Setup API + DB
        api = ApiClient.getClient().create(ApiService.class);
        db = new DBHelper(this);

        // Render cached first
        render(db.getAllBookings());

        // Then fetch live
        fetchFromApi();
    }

    /** Configure title/visibility based on incoming filter */
    private void prepareUiForFilter(String filter) {
        if (filter == null) return; // default: show both sections with counts
        tvPendingCount.setVisibility(View.GONE);
        tvUpcomingCount.setVisibility(View.GONE);

        switch (filter) {
            case "active":
                tvTitle.setText("Active Bookings");
                tvUpcomingHeader.setText("Active");
                tvCompletedHeader.setVisibility(View.GONE);
                recyclerCompleted.setVisibility(View.GONE);
                break;
            case "upcoming":
                tvTitle.setText("Upcoming Bookings");
                tvUpcomingHeader.setText("Upcoming");
                tvCompletedHeader.setVisibility(View.GONE);
                recyclerCompleted.setVisibility(View.GONE);
                break;
            case "past":
                tvTitle.setText("Past Bookings");
                tvUpcomingHeader.setVisibility(View.GONE);
                recyclerCurrent.setVisibility(View.GONE);
                break;
        }
    }

    private void fetchFromApi() {
        String token = new SessionManager(this).getToken();
        if (token == null || token.trim().isEmpty()) {
            Toast.makeText(this, "Session expired. Please log in again.", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        api.getAllBookings("Bearer " + token).enqueue(new Callback<List<Booking>>() {
            @Override public void onResponse(Call<List<Booking>> call, Response<List<Booking>> resp) {
                if (resp.isSuccessful() && resp.body() != null) {
                    db.replaceAllBookings(resp.body());
                    render(resp.body());
                } else {
                    int code = resp.code();
                    String msg = null;
                    try { msg = resp.errorBody() != null ? resp.errorBody().string() : null; } catch (Exception ignored) {}
                    Toast.makeText(ReservationListActivity.this,
                            "Fetch failed: " + code + (msg != null ? (" • " + msg) : ""),
                            Toast.LENGTH_LONG).show();
                }
            }
            @Override public void onFailure(Call<List<Booking>> call, Throwable t) {
                Toast.makeText(ReservationListActivity.this,
                        "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    /** Split + bind lists. Applies filter if provided. */
    private void render(List<Booking> all) {
        if (all == null) all = new ArrayList<>();
        Date now = new Date();

        List<Booking> active = new ArrayList<>();
        List<Booking> upcoming = new ArrayList<>();
        List<Booking> past = new ArrayList<>();
        int pendingCount = 0, approvedFutureCount = 0;

        for (Booking b : all) {
            int s = b.getStatus();
            Date resv = parseIso(b.getReservationDateTime());

            if (s == 0) pendingCount++;
            if (s == 1 && resv != null && resv.after(now)) approvedFutureCount++;

            if (s == 3) active.add(b);                                    // Charging
            else if (s == 1 && resv != null && resv.after(now)) upcoming.add(b); // Approved future
            else if (s == 4) past.add(b);                                 // Completed
        }

        if (filter == null) {
            tvPendingCount.setText("Pending: " + pendingCount);
            tvUpcomingCount.setText("Approved (future): " + approvedFutureCount);

            // Default view: show active+upcoming together on top; past at bottom
            List<Booking> current = new ArrayList<>();
            current.addAll(active);
            current.addAll(upcoming);
            adapterCurrent.update(current);
            adapterCompleted.update(past);
            return;
        }

        // Filtered “see all”
        switch (filter) {
            case "active":
                adapterCurrent.update(active);
                break;
            case "upcoming":
                adapterCurrent.update(upcoming);
                break;
            case "past":
                adapterCompleted.update(past);
                break;
        }
    }

    private Date parseIso(String iso) {
        try {
            if (iso == null) return null;
            String pat = iso.contains(".")
                    ? "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
                    : "yyyy-MM-dd'T'HH:mm:ss'Z'";
            SimpleDateFormat f = new SimpleDateFormat(pat, Locale.US);
            f.setTimeZone(TimeZone.getTimeZone("UTC"));
            return f.parse(iso);
        } catch (Exception e) {
            return null;
        }
    }
}