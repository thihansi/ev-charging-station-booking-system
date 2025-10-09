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
import java.util.List;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.adapters.BookingAdapter;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.utils.EVOwnerSessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PastBookingsFragment extends Fragment implements BookingAdapter.ActionHandler {

    private RecyclerView rv;
    private TextView tvEmpty;
    private BookingAdapter adapter;
    private final List<Booking> data = new ArrayList<>();
    private ApiService api;
    private String bearer;

    @Nullable @Override
    public View onCreateView(@NonNull LayoutInflater inf, @Nullable ViewGroup c, @Nullable Bundle b) {
        View v = inf.inflate(R.layout.fragment_past_bookings, c, false);
        rv = v.findViewById(R.id.rv);
        tvEmpty = v.findViewById(R.id.tvEmpty);

        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        // Past: hide actions
        adapter = new BookingAdapter(data, this, false);
        rv.setAdapter(adapter);

        api = ApiClient.getClient().create(ApiService.class);
        bearer = "Bearer " + EVOwnerSessionManager.getToken(requireContext());
        fetch();
        return v;
    }

    private void fetch() {
        api.getHistoryBookings(bearer).enqueue(new Callback<List<Booking>>() {
            @Override public void onResponse(Call<List<Booking>> call, Response<List<Booking>> res) {
                if (!isAdded()) return;
                if (res.isSuccessful() && res.body() != null) {
                    data.clear();
                    data.addAll(res.body());
                    adapter.notifyDataSetChanged();
                    tvEmpty.setVisibility(data.isEmpty() ? View.VISIBLE : View.GONE);
                } else {
                    Toast.makeText(requireContext(), "Failed to load past bookings", Toast.LENGTH_SHORT).show();
                }
            }
            @Override public void onFailure(Call<List<Booking>> call, Throwable t) {
                if (!isAdded()) return;
                Toast.makeText(requireContext(), "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    // Not used for history, but must implement interface
    @Override public void onCancel(Booking b) {}
    @Override public void onUpdateTime(Booking b) {}
    @Override
    public void onViewQr(Booking b) {}
}