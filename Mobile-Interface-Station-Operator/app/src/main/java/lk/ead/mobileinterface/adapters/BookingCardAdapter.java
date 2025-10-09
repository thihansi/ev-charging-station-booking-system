package lk.ead.mobileinterface.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;
import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.models.Booking;

public class BookingCardAdapter extends RecyclerView.Adapter<BookingCardAdapter.VH> {

    public interface OnClick {
        void onBookingTap(Booking b);
    }

    private List<Booking> data;
    private final OnClick click;

    public BookingCardAdapter(List<Booking> data, OnClick click) {
        this.data = data;
        this.click = click;
    }

    public void submit(List<Booking> newData) {
        this.data = newData;
        notifyDataSetChanged();
    }

    @NonNull @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_booking_card, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH h, int position) {
        Booking b = data.get(position);
        h.tvTitle.setText("Station " + b.getChargingStationId());
        h.tvSubtitle.setText(friendly(b.getReservationDateTime()) + " • " + statusText(b.getStatus()));
        h.itemView.setOnClickListener(v -> { if (click != null) click.onBookingTap(b); });
    }

    @Override public int getItemCount() { return data == null ? 0 : data.size(); }

    static class VH extends RecyclerView.ViewHolder {
        TextView tvTitle, tvSubtitle;
        VH(@NonNull View v) {
            super(v);
            tvTitle = v.findViewById(R.id.tvTitle);
            tvSubtitle = v.findViewById(R.id.tvSubtitle);
        }
    }

    private String statusText(int s) {
        switch (s) {
            case 0: return "Pending";
            case 1: return "Approved";
            case 2: return "Rejected";
            case 3: return "Charging";
            case 4: return "Completed";
            default: return "Unknown";
        }
    }

    private String friendly(String iso) {
        if (iso == null) return "-";
        try {
            String pat = iso.contains(".") ? "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'" : "yyyy-MM-dd'T'HH:mm:ss'Z'";
            SimpleDateFormat in = new SimpleDateFormat(pat, Locale.US);
            in.setTimeZone(TimeZone.getTimeZone("UTC"));
            SimpleDateFormat out = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
            return out.format(in.parse(iso));
        } catch (Exception e) { return iso; }
    }
}