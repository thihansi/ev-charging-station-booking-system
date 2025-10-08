package lk.ead.mobileinterface.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.db.DBHelper;
import lk.ead.mobileinterface.models.StationOperatorLoginRequest;
import lk.ead.mobileinterface.models.StationOperatorLoginResponse;
import lk.ead.mobileinterface.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private EditText etUsername, etPassword;
    private Button btnLogin;
    private ProgressBar progressBar;
    private ApiService apiService;
    private DBHelper dbHelper;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etUsername = findViewById(R.id.etUsername);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        progressBar = findViewById(R.id.progressBar);

        apiService = ApiClient.getClient().create(ApiService.class);
        dbHelper = new DBHelper(this);
        sessionManager = new SessionManager(this);

        btnLogin.setOnClickListener(v -> loginOperator());
    }

    private void loginOperator() {
        String username = etUsername.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (username.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Enter both username and password", Toast.LENGTH_SHORT).show();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);
        btnLogin.setEnabled(false);

        StationOperatorLoginRequest request = new StationOperatorLoginRequest(username, password);
        Call<StationOperatorLoginResponse> call = apiService.operatorLogin(request);

        call.enqueue(new Callback<StationOperatorLoginResponse>() {
            @Override
            public void onResponse(Call<StationOperatorLoginResponse> call, Response<StationOperatorLoginResponse> response) {
                progressBar.setVisibility(View.GONE);
                btnLogin.setEnabled(true);

                if (response.isSuccessful() && response.body() != null) {
                    String token = response.body().getToken();

                    // Save session locally
                    dbHelper.saveOperatorSession(username, token, null);
                    sessionManager.saveSession(username, token);

                    Toast.makeText(LoginActivity.this, "Login successful!", Toast.LENGTH_SHORT).show();

                    Intent intent = new Intent(LoginActivity.this, OperatorDashboardActivity.class);
                    startActivity(intent);
                    finish();
                } else {
                    Toast.makeText(LoginActivity.this, "Invalid credentials", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<StationOperatorLoginResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnLogin.setEnabled(true);
                Toast.makeText(LoginActivity.this, "Login failed: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}
