package lk.ead.mobileinterface.activities;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.util.ArrayList;
import java.util.List;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.db.DBHelper;
import lk.ead.mobileinterface.enumeration.BookingStatus;
import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.models.Station;
import lk.ead.mobileinterface.utils.EVOwnerSessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DashboardActivity extends AppCompatActivity implements OnMapReadyCallback {

    private static final int REQ_LOCATION = 101;
    private static final double NEARBY_RADIUS_KM = 10.0;

    private FusedLocationProviderClient fused;
    private TextView tvTitle, tvPendingCount, tvApprovedCount;
    private ProgressBar progress;
    private Switch swNearby;

    private GoogleMap mMap;
    private ApiService api;
    private String bearer;

    private List<Station> cachedStations = new ArrayList<>();
    private boolean mapReady = false;
    private boolean permissionGranted = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        tvTitle = findViewById(R.id.tvTitle);
        tvPendingCount = findViewById(R.id.tvPendingCount);
        tvApprovedCount = findViewById(R.id.tvApprovedCount);
        progress = findViewById(R.id.progressBar);
        swNearby = findViewById(R.id.swNearby);

        // inside onCreate(), after findViewById(...)
        View cardPending = findViewById(R.id.cardPending);
        View cardApproved = findViewById(R.id.cardApproved);

        cardPending.setOnClickListener(v -> {
            Intent i = new Intent(this, BookingsListActivity.class);
            i.putExtra("filterStatusCode", 0); // 0 = Pending
            startActivity(i);
        });

        cardApproved.setOnClickListener(v -> {
            Intent i = new Intent(this, BookingsListActivity.class);
            i.putExtra("filterStatusCode", 1); // 1 = Approved
            startActivity(i);
        });

        fused = LocationServices.getFusedLocationProviderClient(this);
        api = ApiClient.getClient().create(ApiService.class);

        String token = EVOwnerSessionManager.getToken(this);
        if (token == null) {
            Toast.makeText(this, "Please login again.", Toast.LENGTH_LONG).show();
            finish();
            return;
        }
        bearer = "Bearer " + token;

        // 1) Load whatever is already cached locally (fast UI)
        DBHelper db = new DBHelper(this);
        cachedStations = db.getAllStations();
        Log.d("MAP", "Loaded cachedStations = " + cachedStations.size());

        // 2) Prepare the map; plotting will happen when ready
        SupportMapFragment mapFragment =
                (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.mapFragment);
        if (mapFragment != null) mapFragment.getMapAsync(this);

        // 3) Load server data (also stores locally)
        fetchCounts();            // needs auth
        refreshStationsFromApi(); // no auth unless your API needs it

        // 4) Nearby toggle
        swNearby.setOnCheckedChangeListener((btn, isChecked) -> updatePlotAccordingToToggle());

        BottomNavigationView bottomNav = findViewById(R.id.bottomNavigation);
        bottomNav.setSelectedItemId(R.id.nav_home); // highlight Home

        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.nav_home) {
                return true; // already here
            } else if (id == R.id.nav_bookings) {
                startActivity(new Intent(this, BookingsActivity.class));
                overridePendingTransition(0, 0);
                return true;
            } else if (id == R.id.nav_profile) {
                startActivity(new Intent(this, ProfileActivity.class));
                overridePendingTransition(0, 0);
                return true;
            }
            return false;
        });

    }

    // -------------------- FETCH BOOKING COUNTS --------------------

    private void fetchCounts() {
        setLoading(true);
        api.getUpcomingBookings(bearer).enqueue(new Callback<List<Booking>>() {
            @Override
            public void onResponse(Call<List<Booking>> call, Response<List<Booking>> res) {
                setLoading(false);
                if (res.isSuccessful() && res.body() != null) {
                    int pending = 0, approvedFuture = 0;
                    for (Booking b : res.body()) {
                        BookingStatus status = b.getStatus();
                        if (status == null) continue;

                        switch (status) {
                            case Pending:
                                pending++;
                                break;
                            case Approved:
                                approvedFuture++;
                                break;
                            default:
                                break;
                        }
                    }
                    tvPendingCount.setText(String.valueOf(pending));
                    tvApprovedCount.setText(String.valueOf(approvedFuture));
                } else {
                    Toast.makeText(DashboardActivity.this, "Failed to load counts (" + res.code() + ")", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Booking>> call, Throwable t) {
                setLoading(false);
                Toast.makeText(DashboardActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    // -------------------- MAP LIFECYCLE --------------------

    @Override
    public void onMapReady(@NonNull GoogleMap googleMap) {
        mMap = googleMap;
        mapReady = true;
        enableMyLocation();

        // Center temporarily; will fit to markers after plotting
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(new LatLng(6.9271, 79.8612), 11f));

        // Plot whatever we have cached already
        if (!cachedStations.isEmpty()) {
            updatePlotAccordingToToggle();
        }
    }

    private void enableMyLocation() {
        if (mMap == null) return;
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED) {
            mMap.setMyLocationEnabled(true);
            permissionGranted = true;

            if (mapReady && !cachedStations.isEmpty()) {
                updatePlotAccordingToToggle();
            }
        } else {
            ActivityCompat.requestPermissions(this,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, REQ_LOCATION);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_LOCATION &&
                grantResults.length > 0 &&
                grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            permissionGranted = true;
            enableMyLocation();

            if (mapReady && !cachedStations.isEmpty()) {
                updatePlotAccordingToToggle();
            }
        }
    }

    // -------------------- FETCH + CACHE STATIONS (SERVER → DB → MAP) --------------------

    private void refreshStationsFromApi() {
        // If your backend requires auth to get stations, change to:
        // api.getActiveStations(bearer).enqueue(...)
        api.getActiveStations().enqueue(new Callback<List<Station>>() {
            @Override
            public void onResponse(Call<List<Station>> call, Response<List<Station>> res) {
                if (!res.isSuccessful() || res.body() == null) {
                    Log.w("MAP", "Stations fetch failed: " + res.code());
                    return;
                }

                List<Station> fresh = res.body();

                // Save to DB (upsert/replace)
                DBHelper db = new DBHelper(DashboardActivity.this);
                db.insertStations(fresh);

                // Update in-memory cache
                cachedStations = fresh;
                Log.d("MAP", "Cached " + fresh.size() + " stations from server.");

                // Plot (respect nearby toggle)
                if (mapReady) updatePlotAccordingToToggle();
            }

            @Override
            public void onFailure(Call<List<Station>> call, Throwable t) {
                Log.e("MAP", "Stations API call failed: " + t.getMessage());
                // Keep using cached data silently
            }
        });
    }

    // -------------------- TOGGLE-AWARE PLOTTING --------------------

    private void updatePlotAccordingToToggle() {
        if (!mapReady || mMap == null) return;

        if (!swNearby.isChecked()) {
            plotStationsOnMap(cachedStations);
            fitToStations(cachedStations);
            return;
        }

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, REQ_LOCATION);
            return;
        }

        fused.getLastLocation().addOnSuccessListener(loc -> {
            if (loc == null) {
                Toast.makeText(this, "Location unavailable. Showing all.", Toast.LENGTH_SHORT).show();
                plotStationsOnMap(cachedStations);
                fitToStations(cachedStations);
                return;
            }

            double myLat = loc.getLatitude();
            double myLng = loc.getLongitude();

            List<Station> nearby = filterNearby(cachedStations, myLat, myLng, NEARBY_RADIUS_KM);

            if (nearby.isEmpty()) {
                Toast.makeText(this, "No stations within " + (int) NEARBY_RADIUS_KM + " km.", Toast.LENGTH_SHORT).show();
                plotStationsOnMap(cachedStations);
                fitToStations(cachedStations);
            } else {
                plotStationsOnMap(nearby);
                fitToStations(nearby);
                mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(new LatLng(myLat, myLng), 12f));
            }
        });
    }

    private void plotStationsOnMap(List<Station> stations) {
        if (mMap == null || stations == null) return;
        mMap.clear();
        for (Station s : stations) {
            LatLng pos = new LatLng(s.getLatitude(), s.getLongitude());
            String snippet = (s.getType() == null ? "" : s.getType()) + " | Slots: " + s.getAvailableSlots();
            mMap.addMarker(new MarkerOptions().position(pos).title(s.getName()).snippet(snippet));
        }
    }

    private void fitToStations(List<Station> stations) {
        if (mMap == null || stations == null || stations.isEmpty()) return;
        LatLngBounds.Builder builder = LatLngBounds.builder();
        for (Station s : stations) {
            builder.include(new LatLng(s.getLatitude(), s.getLongitude()));
        }
        try {
            mMap.animateCamera(CameraUpdateFactory.newLatLngBounds(builder.build(), 100));
        } catch (Exception e) {
            Log.w("MAP", "Camera fit failed: " + e.getMessage());
        }
    }

    // -------------------- UTIL --------------------

    private static double distanceKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private List<Station> filterNearby(List<Station> all, double myLat, double myLng, double radiusKm) {
        List<Station> near = new ArrayList<>();
        if (all == null) return near;
        for (Station s : all) {
            if (distanceKm(myLat, myLng, s.getLatitude(), s.getLongitude()) <= radiusKm) {
                near.add(s);
            }
        }
        return near;
    }

    private void setLoading(boolean loading) {
        progress.setVisibility(loading ? View.VISIBLE : View.GONE);
    }
}