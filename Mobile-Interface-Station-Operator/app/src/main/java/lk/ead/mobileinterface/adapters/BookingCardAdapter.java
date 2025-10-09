package lk.ead.mobileinterface.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.models.Booking;

public class BookingCardAdapter extends RecyclerView.Adapter<BookingCardAdapter.VH> {

    public interface OnClick { void onBookingTap(Booking b); }

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

        // Owner name: you may only have NIC here; show NIC or placeholder name
        String owner = b.getEvOwnerNic() != null ? b.getEvOwnerNic() : "EV Owner";
        h.tvOwnerName.setText(owner);

        // Short booking id
        String shortId = b.getId() != null && b.getId().length() >= 6
                ? b.getId().substring(0, 6) : "-";
        h.tvBookingId.setText("ID: #" + shortId);

        // Format time & day in Asia/Colombo
        Date resv = parseIsoUtc(b.getReservationDateTime());
        if (resv != null) {
            h.tvTime.setText(formatTimeInColombo(resv));  // 11:15 AM
            h.tvDay.setText(relativeDayInColombo(resv));  // Today / Tomorrow / Fri, Oct 11
        } else {
            h.tvTime.setText("-");
            h.tvDay.setText("-");
        }

        h.itemView.setOnClickListener(v -> { if (click != null) click.onBookingTap(b); });
    }

    @Override public int getItemCount() { return data == null ? 0 : data.size(); }

    static class VH extends RecyclerView.ViewHolder {
        TextView tvOwnerName, tvBookingId, tvTime, tvDay;
        VH(@NonNull View v) {
            super(v);
            tvOwnerName = v.findViewById(R.id.tvOwnerName);
            tvBookingId = v.findViewById(R.id.tvBookingId);
            tvTime = v.findViewById(R.id.tvTime);
            tvDay = v.findViewById(R.id.tvDay);
        }
    }

    // ---------- Helpers ----------

    private Date parseIsoUtc(String iso) {
        if (iso == null) return null;
        try {
            String pat = iso.contains(".")
                    ? "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
                    : "yyyy-MM-dd'T'HH:mm:ss'Z'";
            SimpleDateFormat in = new SimpleDateFormat(pat, Locale.US);
            in.setTimeZone(TimeZone.getTimeZone("UTC"));
            return in.parse(iso);
        } catch (Exception e) {
            return null;
        }
    }

    private String formatTimeInColombo(Date dateUtc) {
        SimpleDateFormat out = new SimpleDateFormat("hh:mm a", Locale.US);
        out.setTimeZone(TimeZone.getTimeZone("Asia/Colombo"));
        return out.format(dateUtc);
    }

    private String relativeDayInColombo(Date dateUtc) {
        // Make "Today"/"Tomorrow"/"Yesterday" else "EEE, MMM d"
        Calendar now = Calendar.getInstance(TimeZone.getTimeZone("Asia/Colombo"));
        Calendar that = Calendar.getInstance(TimeZone.getTimeZone("Asia/Colombo"));
        that.setTime(dateUtc);

        // Zero out time to compare days
        zeroTime(now);
        zeroTime(that);

        long diffDays = (that.getTimeInMillis() - now.getTimeInMillis()) / (24L * 60L * 60L * 1000L);
        if (diffDays == 0) return "Today";
        if (diffDays == 1) return "Tomorrow";
        if (diffDays == -1) return "Yesterday";

        SimpleDateFormat fmt = new SimpleDateFormat("EEE, MMM d", Locale.US);
        fmt.setTimeZone(TimeZone.getTimeZone("Asia/Colombo"));
        return fmt.format(that.getTime());
    }

    private void zeroTime(Calendar c) {
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.set(Calendar.MILLISECOND, 0);
    }
}