package lk.ead.mobileinterface.activities;

import android.content.Intent;
import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import lk.ead.mobileinterface.R;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        // Prefer SessionManager for a quick check; DBHelper also fine
        lk.ead.mobileinterface.utils.SessionManager sm = new lk.ead.mobileinterface.utils.SessionManager(this);
        String token = sm.getToken();

        Intent next = (token == null)
                ? new Intent(this, LoginActivity.class)
                : new Intent(this, lk.ead.mobileinterface.activities.OperatorDashboardActivity.class);

        startActivity(next);
        finish();
    }
}