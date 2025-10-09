package lk.ead.mobileinterface.activities;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.Calendar;
import java.util.ArrayList;
import java.util.List;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.adapters.BookingAdapter;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.enumeration.BookingStatus;
import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.models.UpdateBookingRequest;
import lk.ead.mobileinterface.utils.EVOwnerSessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookingsListActivity extends AppCompatActivity implements lk.ead.mobileinterface.adapters.BookingAdapter.ActionHandler {

    private RecyclerView rv;
    private ProgressBar progress;
    private TextView tvEmpty, tvTitle;
    private ApiService api;
    private String bearer;
    private int filterStatusCode = -1; // 0=pending,1=approved...
    private final List<Booking> data = new ArrayList<>();
    private BookingAdapter adapter;

    @Override protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bookings_list);

        rv = findViewById(R.id.rvBookings);
        progress = findViewById(R.id.progress);
        tvEmpty = findViewById(R.id.tvEmpty);
        tvTitle = findViewById(R.id.tvTitle);

        filterStatusCode = getIntent().getIntExtra("filterStatusCode", -1);
        tvTitle.setText(filterStatusCode == 0 ? "Pending Reservations" :
                filterStatusCode == 1 ? "Approved Reservations" : "Reservations");

        api = ApiClient.getClient().create(ApiService.class);
        String token = EVOwnerSessionManager.getToken(this);
        if (token == null) {
            Toast.makeText(this, "Session expired. Please login again.", Toast.LENGTH_LONG).show();
            finish();
            return;
        }
        bearer = "Bearer " + token;

        adapter = new lk.ead.mobileinterface.adapters.BookingAdapter(data, this /*action handler*/);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(adapter);

        fetch();
    }

    private void fetch() {
        setLoading(true);
        api.getUpcomingBookings(bearer).enqueue(new Callback<List<Booking>>() {
            @Override public void onResponse(Call<List<Booking>> call, Response<List<Booking>> res) {
                setLoading(false);
                if (!res.isSuccessful() || res.body() == null) {
                    Toast.makeText(BookingsListActivity.this, "Load failed (" + res.code() + ")", Toast.LENGTH_SHORT).show();
                    return;
                }
                data.clear();
                for (Booking b : res.body()) {
                    int code = b.getStatusCode();
                    if (filterStatusCode < 0 || code == filterStatusCode) {
                        data.add(b);
                    }
                }
                adapter.notifyDataSetChanged();
                tvEmpty.setVisibility(data.isEmpty() ? View.VISIBLE : View.GONE);
            }
            @Override public void onFailure(Call<List<Booking>> call, Throwable t) {
                setLoading(false);
                Toast.makeText(BookingsListActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void setLoading(boolean show) {
        progress.setVisibility(show ? View.VISIBLE : View.GONE);
    }

    // --- Actions from Adapter ---

    @Override public void onCancel(Booking b) {
        api.cancelBooking(bearer, b.getId()).enqueue(new Callback<Void>() {
            @Override public void onResponse(Call<Void> call, Response<Void> res) {
                if (res.isSuccessful()) {
                    Toast.makeText(BookingsListActivity.this, "Cancelled", Toast.LENGTH_SHORT).show();
                    fetch();
                } else {
                    Toast.makeText(BookingsListActivity.this, "Cancel failed (" + res.code() + ")", Toast.LENGTH_SHORT).show();
                }
            }
            @Override public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(BookingsListActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    @Override
    public void onUpdateTime(Booking b) {
        // 🚫 Prevent editing if approved
        if (b.getStatus() != null && b.getStatus() == BookingStatus.Approved) {
            Toast.makeText(this, "Approved reservations cannot be modified.", Toast.LENGTH_LONG).show();
            return;
        }

        Calendar cal = Calendar.getInstance();

        DatePickerDialog dp = new DatePickerDialog(this, (view, y, m, d) -> {
            cal.set(Calendar.YEAR, y);
            cal.set(Calendar.MONTH, m);
            cal.set(Calendar.DAY_OF_MONTH, d);

            TimePickerDialog tp = new TimePickerDialog(this, (v, h, mm) -> {
                cal.set(Calendar.HOUR_OF_DAY, h);
                cal.set(Calendar.MINUTE, mm);
                String isoUtc = toUtcIsoMillis(cal);

                b.setReservationDateTime(isoUtc);

                api.updateBooking(bearer, b.getId(), b).enqueue(new Callback<Booking>() {
                    @Override
                    public void onResponse(Call<Booking> call, Response<Booking> res) {
                        if (res.isSuccessful()) {
                            Toast.makeText(BookingsListActivity.this, "Booking time updated!", Toast.LENGTH_SHORT).show();
                            fetch();
                        } else {
                            Toast.makeText(BookingsListActivity.this, "Update failed (" + res.code() + ")", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<Booking> call, Throwable t) {
                        Toast.makeText(BookingsListActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
                    }
                });
            }, cal.get(Calendar.HOUR_OF_DAY), cal.get(Calendar.MINUTE), true);
            tp.show();
        }, cal.get(Calendar.YEAR), cal.get(Calendar.MONTH), cal.get(Calendar.DAY_OF_MONTH));

        dp.getDatePicker().setMinDate(System.currentTimeMillis());
        Calendar maxCal = Calendar.getInstance();
        maxCal.add(Calendar.DAY_OF_YEAR, 7);
        dp.getDatePicker().setMaxDate(maxCal.getTimeInMillis());
        dp.show();
    }

    private String toUtcIsoMillis(Calendar cal) {
        // Clone to avoid modifying original
        Calendar adjusted = (Calendar) cal.clone();

        java.text.SimpleDateFormat sdf =
                new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", java.util.Locale.UK);
        sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Colombo"));

        return sdf.format(adjusted.getTime());
    }
}