package lk.ead.mobileinterface.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import androidx.appcompat.app.AppCompatActivity;

import lk.ead.mobileinterface.R;

public class SplashActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Use the splash theme until content view is set
        setTheme(R.style.Theme_EcoCharge_Splash);
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_splash);

        // super lightweight delay just to show the screen; tweak or remove if you want instant
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            startActivity(new Intent(SplashActivity.this, LoginActivity.class));
            finish(); // prevent back to splash
        }, 1000); // 1s
    }
}