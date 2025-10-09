package lk.ead.mobileinterface.activities;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.activities.EVOwnerLoginActivity;
import lk.ead.mobileinterface.activities.DashboardActivity;
import lk.ead.mobileinterface.utils.EVOwnerSessionManager;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main); // layout can be a simple splash/empty view

        // Read token using static helpers
        String token = EVOwnerSessionManager.getToken(this);

        // Decide next screen
        Intent next = (token == null)
                ? new Intent(this, EVOwnerLoginActivity.class)
                : new Intent(this, DashboardActivity.class);

        startActivity(next);
        finish(); // prevent returning to Main on back press
    }
}