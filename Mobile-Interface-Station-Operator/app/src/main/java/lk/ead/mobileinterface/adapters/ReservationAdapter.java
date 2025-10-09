package lk.ead.mobileinterface.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;
import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.models.Booking;

public class ReservationAdapter extends RecyclerView.Adapter<ReservationAdapter.ViewHolder> {

    private List<Booking> bookings;

    public ReservationAdapter(List<Booking> bookings) {
        this.bookings = bookings;
    }

    public void update(List<Booking> newList) {
        this.bookings = newList;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_reservation, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int position) {
        Booking b = bookings.get(position);
        h.tvStation.setText("Station ID: " + b.getChargingStationId());
        h.tvReservationTime.setText("Reserved at: " + b.getReservationDateTime());
        h.tvStatus.setText("Status: " + getStatusText(b.getStatus()));
    }

    @Override
    public int getItemCount() { return bookings == null ? 0 : bookings.size(); }

    private String getStatusText(int s) {
        switch (s) {
            case 0: return "Pending";
            case 1: return "Approved";
            case 2: return "Rejected";
            case 3: return "Charging";
            case 4: return "Completed";
            default: return "Unknown";
        }
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvStation, tvReservationTime, tvStatus;
        public ViewHolder(@NonNull View v) {
            super(v);
            tvStation = v.findViewById(R.id.tvStation);
            tvReservationTime = v.findViewById(R.id.tvReservationTime);
            tvStatus = v.findViewById(R.id.tvStatus);
        }
    }
}