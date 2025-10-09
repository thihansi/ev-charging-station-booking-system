package lk.ead.mobileinterface.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.adapters.BookingCardAdapter;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.db.DBHelper;
import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class OperatorDashboardActivity extends AppCompatActivity {

    private RecyclerView rvActive, rvUpcoming, rvPast;
    private BookingCardAdapter adActive, adUpcoming, adPast;
    private TextView btnViewAllActive, btnViewAllUpcoming, btnViewAllPast;
    private Button btnScan, btnLogout; // btnGoReservations optional
    private ApiService api;
    private DBHelper db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_operator_dashboard);

        rvActive = findViewById(R.id.rvActive);
        rvUpcoming = findViewById(R.id.rvUpcoming);
        rvPast = findViewById(R.id.rvPast);

        btnViewAllActive = findViewById(R.id.btnViewAllActive);
        btnViewAllUpcoming = findViewById(R.id.btnViewAllUpcoming);
        btnViewAllPast = findViewById(R.id.btnViewAllPast);

        btnScan = findViewById(R.id.btnScan);
        btnLogout = findViewById(R.id.btnLogout);

        rvActive.setLayoutManager(new LinearLayoutManager(this));
        rvUpcoming.setLayoutManager(new LinearLayoutManager(this));
        rvPast.setLayoutManager(new LinearLayoutManager(this));

        adActive = new BookingCardAdapter(new ArrayList<>(), b -> openDetails(b));
        adUpcoming = new BookingCardAdapter(new ArrayList<>(), b -> openDetails(b));
        adPast = new BookingCardAdapter(new ArrayList<>(), b -> openDetails(b));

        rvActive.setAdapter(adActive);
        rvUpcoming.setAdapter(adUpcoming);
        rvPast.setAdapter(adPast);

        api = ApiClient.getClient().create(ApiService.class);
        db  = new DBHelper(this);

        // 1) Render from local cache first
        renderSections(db.getAllBookings());

        // 2) Refresh from API
        fetchAndCache();

        // btnScan.setOnClickListener(v -> startActivity(new Intent(this, ScanQRActivity.class)));

        btnViewAllActive.setOnClickListener(v -> openList("active"));
        btnViewAllUpcoming.setOnClickListener(v -> openList("upcoming"));
        btnViewAllPast.setOnClickListener(v -> openList("past"));

        btnLogout.setOnClickListener(v -> {
            new SessionManager(this).clearSession();
            db.clearOperatorSession();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });
    }

    private void fetchAndCache() {
        String token = new SessionManager(this).getToken();
        if (token == null) return;
        api.getAllBookings("Bearer " + token).enqueue(new Callback<List<Booking>>() {
            @Override
            public void onResponse(Call<List<Booking>> call, Response<List<Booking>> resp) {
                if (!resp.isSuccessful() || resp.body() == null) {
                    Toast.makeText(OperatorDashboardActivity.this, "Failed to fetch bookings", Toast.LENGTH_SHORT).show();
                    return;
                }
                db.replaceAllBookings(resp.body());
                renderSections(resp.body());
            }
            @Override public void onFailure(Call<List<Booking>> call, Throwable t) {
                Toast.makeText(OperatorDashboardActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void renderSections(List<Booking> all) {
        if (all == null) all = new ArrayList<>();
        Date now = new Date();

        List<Booking> active = new ArrayList<>();
        List<Booking> upcoming = new ArrayList<>();
        List<Booking> past = new ArrayList<>();

        for (Booking b : all) {
            int s = b.getStatus();
            Date resv = parseIso(b.getReservationDateTime());
            if (s == 3) { // Charging
                active.add(b);
            } else if (s == 1 && resv != null && resv.after(now)) { // Approved + future
                upcoming.add(b);
            } else if (s == 4) { // Completed
                past.add(b);
            }
        }

        Comparator<Booking> byResvAsc = (x,y) -> safeDate(x).compareTo(safeDate(y));
        Comparator<Booking> byResvDesc = (x,y) -> safeDate(y).compareTo(safeDate(x));
        Collections.sort(upcoming, byResvAsc);
        Collections.sort(past, byResvDesc);

        adActive.submit(limit(active, 1));
        adUpcoming.submit(limit(upcoming, 3));
        adPast.submit(limit(past, 3));
    }

    private List<Booking> limit(List<Booking> src, int n) {
        if (src.size() <= n) return src;
        return new ArrayList<>(src.subList(0, n));
    }

    private Date safeDate(Booking b) {
        Date d = parseIso(b.getReservationDateTime());
        return d == null ? new Date(0) : d;
    }

    private Date parseIso(String iso) {
        try {
            if (iso == null) return null;
            String pat = iso.contains(".") ? "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'" : "yyyy-MM-dd'T'HH:mm:ss'Z'";
            SimpleDateFormat f = new SimpleDateFormat(pat, Locale.US);
            f.setTimeZone(TimeZone.getTimeZone("UTC"));
            return f.parse(iso);
        } catch (Exception e) { return null; }
    }

    private void openDetails(Booking b) {
        Intent i = new Intent(this, ReservationListActivity.class);
        startActivity(i);
    }

    private void openList(String section) {
        Intent i = new Intent(this, ReservationListActivity.class);
        i.putExtra("filter", section); // "active" | "upcoming" | "past"
        startActivity(i);
    }
}