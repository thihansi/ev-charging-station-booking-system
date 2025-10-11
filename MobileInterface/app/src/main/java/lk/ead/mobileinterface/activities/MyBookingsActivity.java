package lk.ead.mobileinterface.activities;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.adapters.MyBookingsPagerAdapter;

public class MyBookingsActivity extends AppCompatActivity {

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_bookings);

        TabLayout tabs = findViewById(R.id.tabLayout);
        ViewPager2 pager = findViewById(R.id.viewPager);
        pager.setAdapter(new MyBookingsPagerAdapter(this));

        new TabLayoutMediator(tabs, pager, (tab, pos) ->
                tab.setText(pos == 0 ? "Upcoming" : "Past")
        ).attach();

        FloatingActionButton fab = findViewById(R.id.fabAdd);
        fab.setOnClickListener(v ->
                startActivity(new Intent(this, BookingsActivity.class)));
    }
}