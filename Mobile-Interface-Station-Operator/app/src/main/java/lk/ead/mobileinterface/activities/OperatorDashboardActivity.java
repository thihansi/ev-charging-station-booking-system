package lk.ead.mobileinterface.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.appbar.MaterialToolbar;
import com.google.android.material.bottomnavigation.BottomNavigationView;

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
import lk.ead.mobileinterface.models.StationBookingsResponse;
import lk.ead.mobileinterface.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class OperatorDashboardActivity extends AppCompatActivity {

    // ---- Backend status map ----
    private static final int STATUS_PENDING   = 0;
    private static final int STATUS_APPROVED  = 1;
    private static final int STATUS_REJECTED  = 2;
    private static final int STATUS_COMPLETED = 3;
    private static final int STATUS_CANCELLED = 4;
    private static final int STATUS_ACTIVE    = 5;

    private boolean showAllActive = false;
    private boolean showAllUpcoming = false;
    private boolean showAllPast = false;

    private List<Booking> cachedAll = new ArrayList<>();

    private RecyclerView rvActive, rvUpcoming, rvPast;
    private BookingCardAdapter adActive, adUpcoming, adPast;
    private TextView btnViewAllActive, btnViewAllUpcoming, btnViewAllPast;
    private Button btnScan, btnLogout;
    private ApiService api;
    private DBHelper db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_operator_dashboard);

        // ------- Toolbar -------
        MaterialToolbar toolbar = findViewById(R.id.toolbar);
        if (toolbar != null) {
            setSupportActionBar(toolbar);
            if (getSupportActionBar() != null) {
                getSupportActionBar().setTitle("Dashboard");
                getSupportActionBar().setDisplayHomeAsUpEnabled(false);
            }
        }

        // ------- Views -------
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

        adActive   = new BookingCardAdapter(new ArrayList<>(), null);
        adUpcoming = new BookingCardAdapter(new ArrayList<>(), null);
        adPast     = new BookingCardAdapter(new ArrayList<>(), null);

        rvActive.setAdapter(adActive);
        rvUpcoming.setAdapter(adUpcoming);
        rvPast.setAdapter(adPast);

        api = ApiClient.getClient().create(ApiService.class);
        db  = new DBHelper(this);

        // Render from cache first
        cachedAll = db.getAllBookings();
        renderSections(cachedAll);

        // Refresh from API
        fetchAndCache();

        // Expand/Collapse toggles
        btnViewAllActive.setOnClickListener(v -> { showAllActive   = !showAllActive;   renderSections(cachedAll); });
        btnViewAllUpcoming.setOnClickListener(v -> { showAllUpcoming = !showAllUpcoming; renderSections(cachedAll); });
        btnViewAllPast.setOnClickListener(v -> { showAllPast     = !showAllPast;     renderSections(cachedAll); });

        btnLogout.setOnClickListener(v -> {
            new SessionManager(this).clearSession();
            db.clearOperatorSession();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        // ------- Bottom Nav  -------
        BottomNavigationView bottom = findViewById(R.id.bottomNav);
        if (bottom != null) {
            bottom.setSelectedItemId(R.id.tab_bookings); // you are on Bookings
            bottom.setOnItemSelectedListener(item -> {
                int id = item.getItemId();
                if (id == R.id.tab_bookings) {
                    return true; // already here
                } else if (id == R.id.tab_scan) {
                    startActivity(new Intent(this, ScanQRActivity.class));
                    overridePendingTransition(0, 0);
                    return true;
                } else if (id == R.id.tab_profile) {
                    Toast.makeText(this, "Profile coming soon", Toast.LENGTH_SHORT).show();
                    return true;
                }
                return false;
            });
        }
    }

    private void fetchAndCache() {
        String token = new SessionManager(this).getToken();
        if (token == null) {
            Toast.makeText(this, "Missing token", Toast.LENGTH_SHORT).show();
            return;
        }
        api.getBookingsForMyStation("Bearer " + token)
                .enqueue(new Callback<StationBookingsResponse>() {
                    @Override
                    public void onResponse(Call<StationBookingsResponse> call,
                                           Response<StationBookingsResponse> resp) {
                        if (!resp.isSuccessful() || resp.body() == null || resp.body().bookings == null) {
                            Toast.makeText(OperatorDashboardActivity.this,
                                    "Failed to fetch bookings", Toast.LENGTH_SHORT).show();
                            return;
                        }
                        cachedAll = resp.body().bookings;
                        db.replaceAllBookings(cachedAll);
                        renderSections(cachedAll);
                    }

                    @Override
                    public void onFailure(Call<StationBookingsResponse> call, Throwable t) {
                        Toast.makeText(OperatorDashboardActivity.this,
                                "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
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

            if (s == STATUS_ACTIVE) {
                active.add(b);
            } else if (s == STATUS_APPROVED && resv != null && resv.after(now)) {
                upcoming.add(b);
            } else if (s == STATUS_COMPLETED || s == STATUS_CANCELLED) {
                past.add(b);
            }
        }

        // Sort: upcoming soonest → first, past newest → first
        Comparator<Booking> byResvAsc  = (x, y) -> safeDate(x).compareTo(safeDate(y));
        Comparator<Booking> byResvDesc = (x, y) -> safeDate(y).compareTo(safeDate(x));
        Collections.sort(upcoming, byResvAsc);
        Collections.sort(past, byResvDesc);

        // Preview vs View-all
        adActive.submit(showAllActive ? active : limit(active, 1));
        adUpcoming.submit(showAllUpcoming ? upcoming : limit(upcoming, 3));
        adPast.submit(showAllPast ? past : limit(past, 3));

        // Button labels
        btnViewAllActive.setText(showAllActive ? "View less" : "View all");
        btnViewAllUpcoming.setText(showAllUpcoming ? "View less" : "View all");
        btnViewAllPast.setText(showAllPast ? "View less" : "View all");
    }

    private List<Booking> limit(List<Booking> src, int n) {
        if (src == null || src.size() <= n) return src;
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
}