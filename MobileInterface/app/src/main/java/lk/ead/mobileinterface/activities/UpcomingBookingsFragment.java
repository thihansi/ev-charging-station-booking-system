package lk.ead.mobileinterface.activities;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.adapters.BookingAdapter;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.enumeration.BookingStatus;
import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.utils.EVOwnerSessionManager;
import lk.ead.mobileinterface.activities.QrDialogFragment;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UpcomingBookingsFragment extends Fragment implements BookingAdapter.ActionHandler {

    private RecyclerView rvPending, rvApproved;
    private TextView tvEmptyPending, tvEmptyApproved;
    private BookingAdapter pendingAdapter, approvedAdapter;
    private final List<Booking> pendingList = new ArrayList<>();
    private final List<Booking> approvedList = new ArrayList<>();

    private ApiService api;
    private String bearer;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        View v = inf.inflate(R.layout.fragment_bookings_list, c, false);

        rvPending = v.findViewById(R.id.rvPending);
        rvApproved = v.findViewById(R.id.rvApproved);
        tvEmptyPending = v.findViewById(R.id.tvEmptyPending);
        tvEmptyApproved = v.findViewById(R.id.tvEmptyApproved);

        rvPending.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvApproved.setLayoutManager(new LinearLayoutManager(requireContext()));

        pendingAdapter = new BookingAdapter(pendingList, this, true); // actions allowed
        approvedAdapter = new BookingAdapter(approvedList, this, false); // read-only

        rvPending.setAdapter(pendingAdapter);
        rvApproved.setAdapter(approvedAdapter);

        api = ApiClient.getClient().create(ApiService.class);
        bearer = "Bearer " + EVOwnerSessionManager.getToken(requireContext());

        fetch();

        return v;
    }

    private void fetch() {
        api.getUpcomingBookings(bearer).enqueue(new Callback<List<Booking>>() {
            @Override
            public void onResponse(Call<List<Booking>> call, Response<List<Booking>> res) {
                if (!isAdded()) return;
                if (res.isSuccessful() && res.body() != null) {
                    pendingList.clear();
                    approvedList.clear();

                    for (Booking b : res.body()) {
                        BookingStatus st = b.getStatus();
                        if (st == BookingStatus.Pending) {
                            pendingList.add(b);
                        } else if (st == BookingStatus.Approved) {
                            approvedList.add(b);
                        }
                    }

                    pendingAdapter.notifyDataSetChanged();
                    approvedAdapter.notifyDataSetChanged();

                    tvEmptyPending.setVisibility(pendingList.isEmpty() ? View.VISIBLE : View.GONE);
                    tvEmptyApproved.setVisibility(approvedList.isEmpty() ? View.VISIBLE : View.GONE);
                } else {
                    Toast.makeText(requireContext(), "Failed to load upcoming bookings", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<Booking>> call, Throwable t) {
                if (!isAdded()) return;
                Toast.makeText(requireContext(), "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    // Hook your existing logic
    @Override public void onCancel(Booking b) {
        api.cancelBooking(bearer, b.getId()).enqueue(new Callback<Void>() {
            @Override public void onResponse(Call<Void> call, Response<Void> res) {
                if (res.isSuccessful()) {
                    Toast.makeText(requireContext(), "Cancelled", Toast.LENGTH_SHORT).show();
                    fetch();
                } else {
                    Toast.makeText(requireContext(), "Cancel failed (" + res.code() + ")", Toast.LENGTH_SHORT).show();
                }
            }
            @Override public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(requireContext(), "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
    @Override
    public void onUpdateTime(Booking b) {

        if (b.getStatus() != null && b.getStatus() == BookingStatus.Approved) {
            Toast.makeText(requireContext(), "Approved reservations cannot be modified.", Toast.LENGTH_LONG).show();
            return;
        }

        // 🕒 Parse existing reservation time
        try {
            java.text.SimpleDateFormat input =
                    new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", java.util.Locale.US);
            Date reservation = input.parse(b.getReservationDateTime());
            long now = System.currentTimeMillis();

            // If reservation is within 12 hours → reject
            if (reservation != null && (reservation.getTime() - now) < (12 * 60 * 60 * 1000)) {
                Toast.makeText(requireContext(), "You can only update reservations at least 12 hours in advance.", Toast.LENGTH_LONG).show();
                return;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // ✅ Continue to date picker if allowed
        Calendar cal = Calendar.getInstance();

        android.app.DatePickerDialog dp = new android.app.DatePickerDialog(requireContext(), (view, y, m, d) -> {
            cal.set(Calendar.YEAR, y);
            cal.set(Calendar.MONTH, m);
            cal.set(Calendar.DAY_OF_MONTH, d);

            android.app.TimePickerDialog tp = new android.app.TimePickerDialog(requireContext(), (v, h, mm) -> {
                cal.set(Calendar.HOUR_OF_DAY, h);
                cal.set(Calendar.MINUTE, mm);
                String isoUtc = toColomboIsoMillis(cal);

                b.setReservationDateTime(isoUtc);

                api.updateBooking(bearer, b.getId(), b).enqueue(new Callback<Booking>() {
                    @Override
                    public void onResponse(Call<Booking> call, Response<Booking> res) {
                        if (res.isSuccessful()) {
                            Toast.makeText(requireContext(), "Booking time updated!", Toast.LENGTH_SHORT).show();
                            fetch();
                        } else {
                            Toast.makeText(requireContext(), "Update failed (" + res.code() + ")", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<Booking> call, Throwable t) {
                        Toast.makeText(requireContext(), "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
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

    private String toColomboIsoMillis(Calendar cal) {
        if (cal == null) return null;

        // Clone to avoid modifying the original
        Calendar copy = (Calendar) cal.clone();

        // ✅ Add +5 hours and 30 minutes manually
        copy.add(Calendar.HOUR_OF_DAY, 5);
        copy.add(Calendar.MINUTE, 30);

        java.text.SimpleDateFormat sdf =
                new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", java.util.Locale.US);
        sdf.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Colombo")); // ensure offset is shown correctly

        return sdf.format(copy.getTime()); // e.g. 2025-10-12T14:30:00.000+05:30
    }

    @Override
    public void onViewQr(Booking b) {
        if (b.getQrCode() == null || b.getQrCode().trim().isEmpty()) {
            Toast.makeText(requireContext(), "No QR available for this booking.", Toast.LENGTH_SHORT).show();
            return;
        }

        QrDialogFragment.newInstance(b.getQrCode())
                .show(getChildFragmentManager(), "qr");
    }
}