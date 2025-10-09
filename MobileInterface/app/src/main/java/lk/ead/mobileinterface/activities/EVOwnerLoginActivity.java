package lk.ead.mobileinterface.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.models.EVOwnerLoginRequest;
import lk.ead.mobileinterface.models.EVOwnerLoginResponse;
import lk.ead.mobileinterface.models.User;
import lk.ead.mobileinterface.utils.EVOwnerSessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EVOwnerLoginActivity extends AppCompatActivity {

    private EditText etNic, etPassword;
    private Button btnLogin, btnGoRegister;
    private ProgressBar progress;
    private ApiService api;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ev_owner_login);

        etNic = findViewById(R.id.etNic);             // 👈 change layout to have NIC field
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        btnGoRegister = findViewById(R.id.btnGoRegister);
        progress = findViewById(R.id.progressBar);

        api = ApiClient.getClient().create(ApiService.class);

        btnLogin.setOnClickListener(v -> attemptLogin());
        btnGoRegister.setOnClickListener(v -> startActivity(new Intent(this, EVOwnerRegisterActivity.class)));

        if (EVOwnerSessionManager.getToken(this) != null) {
            goToDashboard();
        }

    }

    private void attemptLogin() {
        String nic = etNic.getText().toString().trim();
        String password = etPassword.getText().toString();

        if (!isValid(nic, password)) return;

        setLoading(true);
        api.login(new EVOwnerLoginRequest(nic, password))
                .enqueue(new Callback<EVOwnerLoginResponse>() {
                    @Override
                    public void onResponse(Call<EVOwnerLoginResponse> call, Response<EVOwnerLoginResponse> res) {
                        setLoading(false);
                        if (res.isSuccessful() && res.body() != null) {
                            EVOwnerLoginResponse body = res.body();
                            String token = body.getToken();
                            User user = body.getEvOwner();

                            if (TextUtils.isEmpty(token)) {
                                Toast.makeText(EVOwnerLoginActivity.this, "No token returned", Toast.LENGTH_LONG).show();
                                return;
                            }

                            EVOwnerSessionManager.saveToken(EVOwnerLoginActivity.this, token);
                            if (user != null && user.getNic() != null) {
                                EVOwnerSessionManager.saveNic(EVOwnerLoginActivity.this, user.getNic());
                            }


                            Toast.makeText(EVOwnerLoginActivity.this, "Welcome!", Toast.LENGTH_SHORT).show();
                            goToDashboard();
                        } else if (res.code() == 401) {
                            Toast.makeText(EVOwnerLoginActivity.this, "Invalid NIC or password", Toast.LENGTH_LONG).show();
                        } else {
                            Toast.makeText(EVOwnerLoginActivity.this, "Login failed (" + res.code() + ")", Toast.LENGTH_LONG).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<EVOwnerLoginResponse> call, Throwable t) {
                        setLoading(false);
                        Toast.makeText(EVOwnerLoginActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
                    }
                });
    }

    private boolean isValid(String nic, String password) {
        if (TextUtils.isEmpty(nic)) {
            etNic.setError("NIC is required");
            etNic.requestFocus();
            return false;
        }
        if (TextUtils.isEmpty(password) || password.length() < 6) {
            etPassword.setError("Password must be at least 6 chars");
            etPassword.requestFocus();
            return false;
        }
        return true;
    }

    private void setLoading(boolean loading) {
        progress.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnLogin.setEnabled(!loading);
        btnGoRegister.setEnabled(!loading);
    }

    private void goToDashboard() {
        Intent intent = new Intent(EVOwnerLoginActivity.this, DashboardActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
        finish(); // ✅ Close login so back button won’t return here
    }
}