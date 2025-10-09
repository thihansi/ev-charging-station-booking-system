package lk.ead.mobileinterface.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.enumeration.BookingStatus;
import lk.ead.mobileinterface.models.Booking;

public class BookingAdapter extends RecyclerView.Adapter<BookingAdapter.VH> {

    public interface ActionHandler {
        void onCancel(Booking b);
        void onUpdateTime(Booking b);
    }

    private final List<Booking> items;
    private final ActionHandler handler;

    public BookingAdapter(List<Booking> items, ActionHandler handler) {
        this.items = items;
        this.handler = handler;
    }

    @NonNull @Override public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_booking, parent, false);
        return new VH(v);
    }
    private String formatBookingId(String rawId) {
        if (rawId == null || rawId.length() < 8) return "#BK-UNKNOWN";
        // Take last 8 chars of UUID, uppercase, add prefix
        String shortPart = rawId.substring(rawId.length() - 8).toUpperCase();
        return "#BK-" + shortPart;
    }
    private String formatDisplayDateTime(String isoString) {
        if (isoString == null || isoString.isEmpty()) return "-";

        try {
            // Parse the backend's ISO time (UTC with 'Z')
            java.text.SimpleDateFormat input =
                    new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US);
            input.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));

            java.util.Date date = input.parse(isoString);

            // Convert to local time and show nicely
            java.text.SimpleDateFormat output =
                    new java.text.SimpleDateFormat("dd MMM yyyy, hh:mm a", java.util.Locale.US);
            output.setTimeZone(java.util.TimeZone.getTimeZone("Asia/Colombo"));

            return output.format(date);
        } catch (Exception e) {
            e.printStackTrace();
            return isoString; // fallback to raw
        }
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int pos) {
        Booking b = items.get(pos);

        // Format booking info
        h.tvId.setText("ID: " + formatBookingId(b.getId()));
        h.tvWhen.setText("When: " + formatDisplayDateTime(b.getReservationDateTime()));
        BookingStatus st = b.getStatus();
        h.tvStatus.setText("Status: " + (st != null ? st.getLabel() : ("#" + b.getStatusCode())));

        // --- Default visibility ---
        h.btnUpdate.setVisibility(View.VISIBLE);
        h.btnCancel.setVisibility(View.VISIBLE);

        // --- Hide Update for Approved bookings ---
        if (st == BookingStatus.Approved) {
            h.btnUpdate.setVisibility(View.GONE);
        }

        // --- Disable both for Completed / Cancelled bookings ---
        if (st == BookingStatus.Completed || st == BookingStatus.Cancelled) {
            h.btnUpdate.setVisibility(View.GONE);
            h.btnCancel.setEnabled(false);
            h.btnCancel.setAlpha(0.5f); // faded visual
        }

        // --- Button actions ---
        h.btnUpdate.setOnClickListener(v -> handler.onUpdateTime(b));
        h.btnCancel.setOnClickListener(v -> handler.onCancel(b));
    }

    @Override public int getItemCount() { return items.size(); }

    static class VH extends RecyclerView.ViewHolder {
        TextView tvId, tvWhen, tvStatus;
        Button btnUpdate, btnCancel;
        VH(@NonNull View v) {
            super(v);
            tvId = v.findViewById(R.id.tvId);
            tvWhen = v.findViewById(R.id.tvWhen);
            tvStatus = v.findViewById(R.id.tvStatus);
            btnUpdate = v.findViewById(R.id.btnUpdate);
            btnCancel = v.findViewById(R.id.btnCancel);
        }
    }
}