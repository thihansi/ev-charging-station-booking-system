package lk.ead.mobileinterface.activities;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.db.DBHelper;
import lk.ead.mobileinterface.enumeration.StationType;
import lk.ead.mobileinterface.models.Station;
import retrofit2.Call;
import retrofit2.Response;

public class BookingsActivity extends AppCompatActivity {

    private Spinner spStation;
    private Button btnPickDate, btnPickTime, btnConfirm;
    private TextView tvDate, tvTime, tvSummary;

    private final Calendar selectedCal = Calendar.getInstance();
    private final SimpleDateFormat dateFmt = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
    private final SimpleDateFormat timeFmt = new SimpleDateFormat("HH:mm", Locale.getDefault());

    private List<Station> stations = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bookings);

        spStation   = findViewById(R.id.spStation);
        btnPickDate = findViewById(R.id.btnPickDate);
        btnPickTime = findViewById(R.id.btnPickTime);
        btnConfirm  = findViewById(R.id.btnConfirm);
        tvDate      = findViewById(R.id.tvDate);
        tvTime      = findViewById(R.id.tvTime);
        tvSummary   = findViewById(R.id.tvSummary);

        setupBottomNav();
        loadStations();
        initPickers();

        btnConfirm.setOnClickListener(v -> confirmSummary());
    }

    private void setupBottomNav() {
        BottomNavigationView bottomNav = findViewById(R.id.bottomNavigation);
        bottomNav.setSelectedItemId(R.id.nav_bookings);
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.nav_home) {
                startActivity(new Intent(this, DashboardActivity.class));
                overridePendingTransition(0, 0);
                return true;
            } else if (id == R.id.nav_bookings) {
                return true;
            } else if (id == R.id.nav_profile) {
                startActivity(new Intent(this, ProfileActivity.class));
                overridePendingTransition(0, 0);
                return true;
            }
            return false;
        });
    }

    // BookingsActivity.java

    private void loadStations() {
        DBHelper db = new DBHelper(this);
        stations = db.getAllStations();

        if (stations == null || stations.isEmpty()) {
            // No cache → fetch from server then cache
            fetchStationsFromServer();
        } else {
            bindStationsToSpinner(stations);
        }
    }

    private void fetchStationsFromServer() {
        ApiService api = ApiClient.getClient().create(ApiService.class);

        // If your endpoint needs auth, uncomment:
        // String token = EVOwnerSessionManager.getToken(this);
        // String bearer = (token == null) ? null : "Bearer " + token;
        // api.getActiveStations(bearer).enqueue( ... )

        api.getActiveStations().enqueue(new retrofit2.Callback<List<Station>>() {
            @Override public void onResponse(Call<List<Station>> call, Response<List<Station>> res) {
                if (!res.isSuccessful() || res.body() == null) {
                    Toast.makeText(BookingsActivity.this, "Failed to fetch stations (" + res.code() + ")", Toast.LENGTH_SHORT).show();
                    bindStationsToSpinner(new ArrayList<>()); // show “No stations”
                    return;
                }

                List<Station> dtos = res.body();
                List<Station> mapped = mapDtosToStations(dtos);

                if (mapped.isEmpty()) {
                    Toast.makeText(BookingsActivity.this, "No usable stations from server.", Toast.LENGTH_SHORT).show();
                    bindStationsToSpinner(new ArrayList<>());
                    return;
                }

                // cache locally
                DBHelper db = new DBHelper(BookingsActivity.this);
                db.insertStations(mapped);

                stations = mapped;
                bindStationsToSpinner(stations);
            }

            @Override public void onFailure(Call<List<Station>> call, Throwable t) {
                Toast.makeText(BookingsActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
                bindStationsToSpinner(new ArrayList<>());
            }
        });
    }

    private void bindStationsToSpinner(List<Station> data) {
        List<String> names = new ArrayList<>();
        if (data != null && !data.isEmpty()) {
            for (Station s : data) names.add(s.getName());
        } else {
            names.add("No stations");
        }

        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this, android.R.layout.simple_spinner_dropdown_item, names);
        spStation.setAdapter(adapter);

        updateSummary();
    }

    private List<Station> mapDtosToStations(List<Station> dtos) {
        List<Station> out = new ArrayList<>();
        if (dtos == null) return out;

        for (Station d : dtos) {
            if (!isValidCoord(d.getLatitude(), d.getLongitude())) continue;

            Station s = new Station();
            s.setId(d.getId());
            s.setName(nullToEmpty(d.getName()));
            s.setAddress(nullToEmpty(d.getAddress()));
            s.setLatitude(d.getLatitude());
            s.setLongitude(d.getLongitude());

            // ✅ map int enum -> StationType
            StationType t = d.getType(); // already StationType
            s.setType(t);

            s.setAvailableSlots(d.getAvailableSlots());
            s.setSchedule(nullToEmpty(d.getSchedule()));
            s.setActive(d.isActive());
            out.add(s);
        }
        return out;
    }

    private boolean isValidCoord(double lat, double lng) {
        if (lat == 0 && lng == 0) return false; // filter likely placeholders
        // Optional: keep only Sri Lanka-ish bounds
        return lat >= 5.8 && lat <= 9.9 && lng >= 79.4 && lng <= 81.9;
    }

    private String nullToEmpty(String v) { return v == null ? "" : v; }

    private void initPickers() {
        tvDate.setText("--");
        tvTime.setText("--");

        btnPickDate.setOnClickListener(v -> showDatePicker());
        btnPickTime.setOnClickListener(v -> showTimePicker());
    }

    private void showDatePicker() {
        final Calendar today = Calendar.getInstance();
        final Calendar max = Calendar.getInstance();
        max.add(Calendar.DAY_OF_YEAR, 7);

        DatePickerDialog dp = new DatePickerDialog(
                this,
                (DatePicker view, int year, int month, int dayOfMonth) -> {
                    selectedCal.set(Calendar.YEAR, year);
                    selectedCal.set(Calendar.MONTH, month);
                    selectedCal.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                    tvDate.setText(dateFmt.format(selectedCal.getTime()));
                    updateSummary();
                },
                today.get(Calendar.YEAR),
                today.get(Calendar.MONTH),
                today.get(Calendar.DAY_OF_MONTH)
        );
        dp.getDatePicker().setMinDate(today.getTimeInMillis());
        dp.getDatePicker().setMaxDate(max.getTimeInMillis());
        dp.show();
    }

    private void showTimePicker() {
        int hour = selectedCal.get(Calendar.HOUR_OF_DAY);
        int minute = selectedCal.get(Calendar.MINUTE);

        new TimePickerDialog(
                this,
                (view, h, m) -> {
                    selectedCal.set(Calendar.HOUR_OF_DAY, h);
                    selectedCal.set(Calendar.MINUTE, m);
                    tvTime.setText(timeFmt.format(selectedCal.getTime()));
                    updateSummary();
                },
                hour, minute, true
        ).show();
    }

    private void updateSummary() {
        String stationName = (spStation.getSelectedItem() == null) ? "" : spStation.getSelectedItem().toString();
        String date = tvDate.getText().toString();
        String time = tvTime.getText().toString();

        String summary = "Station: " + (TextUtils.isEmpty(stationName) ? "-" : stationName)
                + "\nDate: " + (date.equals("--") ? "-" : date)
                + "\nTime: " + (time.equals("--") ? "-" : time);

        tvSummary.setText(summary);
    }

    private void confirmSummary() {
        if (stations.isEmpty() || spStation.getSelectedItem() == null || "No stations".contentEquals(spStation.getSelectedItem().toString())) {
            Toast.makeText(this, "Please sync stations from Home first.", Toast.LENGTH_SHORT).show();
            return;
        }
        if ("--".contentEquals(tvDate.getText()) || "--".contentEquals(tvTime.getText())) {
            Toast.makeText(this, "Please select date and time.", Toast.LENGTH_SHORT).show();
            return;
        }
        Toast.makeText(this, "Booking ready:\n" + tvSummary.getText(), Toast.LENGTH_LONG).show();
        // TODO: build BookingRequest and call API
    }
}