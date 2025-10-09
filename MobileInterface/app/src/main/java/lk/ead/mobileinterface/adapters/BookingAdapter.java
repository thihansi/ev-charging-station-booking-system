package lk.ead.mobileinterface.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.enumeration.BookingStatus;
import lk.ead.mobileinterface.models.Booking;

public class BookingAdapter extends RecyclerView.Adapter<BookingAdapter.VH> {

    public interface ActionHandler {
        void onCancel(Booking b);
        void onUpdateTime(Booking b);
        void onViewQr(Booking b);
    }

    private final List<Booking> items;
    private final ActionHandler handler;
    private final boolean showActions;

    public BookingAdapter(List<Booking> items, ActionHandler handler, boolean showActions) {
        this.items = items;
        this.handler = handler;
        this.showActions = showActions;
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_booking, parent, false);
        return new VH(v);
    }

    private String formatBookingId(String rawId) {
        if (rawId == null || rawId.length() < 8) return "#BK-UNKNOWN";
        String shortPart = rawId.substring(rawId.length() - 8).toUpperCase();
        return "#BK-" + shortPart;
    }

    private String formatDisplayDateTime(String isoString) {
        if (isoString == null || isoString.isEmpty()) return "-";
        try {
            // Remove fractional seconds and any trailing zone (Z or +05:30 / -0400 etc.)
            String cleaned = isoString.replaceFirst("(\\.\\d{1,9})?(Z|[+-]\\d{2}:?\\d{2})?$", "");
            // Example: "2025-10-12T14:30:00.000+05:30" -> "2025-10-12T14:30:00"

            // Parse the cleaned value exactly as it looks (note: keep the 'T' here)
            java.text.SimpleDateFormat in =
                    new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", java.util.Locale.US);
            java.util.Date date = in.parse(cleaned);

            // Pretty print. No timezone set => no conversion; just formats the parsed local time.
            java.text.SimpleDateFormat out =
                    new java.text.SimpleDateFormat("dd MMM yyyy, hh:mm a", java.util.Locale.UK);
            return out.format(date);
        } catch (Exception e) {
            e.printStackTrace();
            return isoString; // fallback
        }
    }

    private boolean isWithin12Hours(String isoString) {
        try {
            SimpleDateFormat input = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.US);
            input.setTimeZone(TimeZone.getTimeZone("Asia/Colombo"));
            Date date = input.parse(isoString);
            if (date == null) return false;

            long diffMs = date.getTime() - System.currentTimeMillis();
            return diffMs < (12 * 60 * 60 * 1000); // less than 12 hours
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int pos) {
        Booking b = items.get(pos);

        h.tvId.setText("ID: " + formatBookingId(b.getId()));
        h.tvWhen.setText("When: " + formatDisplayDateTime(b.getReservationDateTime()));
        BookingStatus st = b.getStatus();
        h.tvStatus.setText("Status: " + (st != null ? st.getLabel() : ("#" + b.getStatusCode())));

        h.btnUpdate.setVisibility(View.VISIBLE);
        h.btnCancel.setVisibility(View.VISIBLE);
        h.btnViewQr.setVisibility(View.GONE);

        boolean hasQr = (st == BookingStatus.Approved)
                && b.getQrCode() != null
                && !b.getQrCode().trim().isEmpty();
        if (hasQr) h.btnViewQr.setVisibility(View.VISIBLE);

        h.btnUpdate.setEnabled(true);
        h.btnCancel.setEnabled(true);
        h.btnCancel.setAlpha(1f);

        // Hide Update button for Approved bookings
        if (st == BookingStatus.Approved) {
            h.btnUpdate.setVisibility(View.GONE);
        }

        // Disable buttons for Completed or Cancelled
        if (st == BookingStatus.Completed || st == BookingStatus.Cancelled) {
            h.btnUpdate.setVisibility(View.GONE);
            h.btnCancel.setEnabled(false);
            h.btnCancel.setAlpha(0.5f);
        }

        // Disable actions if within 12 hours of reservation
        if (b.getReservationDateTime() != null && isWithin12Hours(b.getReservationDateTime())) {
            h.btnUpdate.setEnabled(false);
            h.btnCancel.setEnabled(false);
            h.btnUpdate.setAlpha(0.5f);
            h.btnCancel.setAlpha(0.5f);
        }

        // Button listeners
        h.btnUpdate.setOnClickListener(v -> handler.onUpdateTime(b));
        h.btnCancel.setOnClickListener(v -> handler.onCancel(b));
        h.btnViewQr.setOnClickListener(v -> handler.onViewQr(b));
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class VH extends RecyclerView.ViewHolder {
        TextView tvId, tvWhen, tvStatus;
        Button btnUpdate, btnCancel, btnViewQr;

        VH(@NonNull View v) {
            super(v);
            tvId = v.findViewById(R.id.tvId);
            tvWhen = v.findViewById(R.id.tvWhen);
            tvStatus = v.findViewById(R.id.tvStatus);
            btnUpdate = v.findViewById(R.id.btnUpdate);
            btnCancel = v.findViewById(R.id.btnCancel);
            btnViewQr = v.findViewById(R.id.btnViewQr);
        }
    }
}