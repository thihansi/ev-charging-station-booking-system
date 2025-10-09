package lk.ead.mobileinterface.adapters;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import lk.ead.mobileinterface.activities.PastBookingsFragment;
import lk.ead.mobileinterface.activities.UpcomingBookingsFragment;

public class MyBookingsPagerAdapter extends FragmentStateAdapter {
    public MyBookingsPagerAdapter(@NonNull AppCompatActivity act) { super(act); }

    @NonNull @Override public Fragment createFragment(int position) {
        return position == 0 ? new UpcomingBookingsFragment() : new PastBookingsFragment();
    }

    @Override public int getItemCount() { return 2; }
}
