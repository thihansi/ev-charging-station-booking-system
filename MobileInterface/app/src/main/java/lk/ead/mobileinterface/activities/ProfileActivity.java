package lk.ead.mobileinterface.activities;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Switch;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import lk.ead.mobileinterface.R;
import lk.ead.mobileinterface.api.ApiClient;
import lk.ead.mobileinterface.api.ApiService;
import lk.ead.mobileinterface.models.User;
import lk.ead.mobileinterface.utils.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends AppCompatActivity {

    private EditText etNic, etName, etEmail, etPhone;
    private Switch swActive;
    private Button btnSave, btnDeactivate, btnLogout;
    private ProgressBar progress;

    private ApiService api;
    private String bearer;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        etNic = findViewById(R.id.etNic);
        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPhone = findViewById(R.id.etPhone);
        swActive = findViewById(R.id.swActive);
        btnSave = findViewById(R.id.btnSave);
        btnDeactivate = findViewById(R.id.btnDeactivate);
        btnLogout = findViewById(R.id.btnLogout);
        progress = findViewById(R.id.progressBar);

        api = ApiClient.getClient().create(ApiService.class);
        String token = SessionManager.getToken(this);
        if (token == null) {
            goToLogin();
            return;
        }
        bearer = "Bearer " + token;

        loadProfile();

        btnSave.setOnClickListener(v -> updateProfile());
        btnDeactivate.setOnClickListener(v -> confirmDeactivate());
        btnLogout.setOnClickListener(v -> {
            SessionManager.clear(this);
            goToLogin();
        });

        // NIC and email generally immutable in many systems—lock editing if required:
        etNic.setEnabled(false); // toggle if your backend allows change
        etEmail.setEnabled(false);
        swActive.setEnabled(false); // active state is server-controlled
    }

    private void loadProfile() {
        setLoading(true);
        api.getProfile(bearer).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> res) {
                setLoading(false);
                if (res.isSuccessful() && res.body() != null) {
                    User u = res.body();
                    etNic.setText(n(u.getNic()));
                    etName.setText(n(u.getName()));
                    etEmail.setText(n(u.getEmail()));
                    etPhone.setText(n(u.getPhone()));
                    swActive.setChecked(u.isActive());
                } else if (res.code() == 401) {
                    SessionManager.clear(ProfileActivity.this);
                    goToLogin();
                } else {
                    Toast.makeText(ProfileActivity.this,
                            "Failed to load profile (" + res.code() + ")",
                            Toast.LENGTH_LONG).show();
                }
            }
            @Override
            public void onFailure(Call<User> call, Throwable t) {
                setLoading(false);
                Toast.makeText(ProfileActivity.this,
                        "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void updateProfile() {
        String name = s(etName);
        String phone = s(etPhone);

        if (TextUtils.isEmpty(name)) {
            etName.setError("Name required");
            etName.requestFocus();
            return;
        }
        if (TextUtils.isEmpty(phone) || phone.length() < 7) {
            etPhone.setError("Valid phone required");
            etPhone.requestFocus();
            return;
        }

        User payload = new User();
        payload.setNic(s(etNic));             // keep server reference
        payload.setName(name);
        payload.setEmail(s(etEmail));         // usually immutable; backend will ignore if not allowed
        payload.setPhone(phone);
        payload.setActive(swActive.isChecked());

        setLoading(true);
        api.updateProfile(bearer, payload).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> res) {
                setLoading(false);
                if (res.isSuccessful() && res.body() != null) {
                    Toast.makeText(ProfileActivity.this, "Profile updated", Toast.LENGTH_SHORT).show();
                } else if (res.code() == 400) {
                    Toast.makeText(ProfileActivity.this, "Validation error", Toast.LENGTH_LONG).show();
                } else if (res.code() == 401) {
                    SessionManager.clear(ProfileActivity.this);
                    goToLogin();
                } else {
                    Toast.makeText(ProfileActivity.this,
                            "Update failed (" + res.code() + ")",
                            Toast.LENGTH_LONG).show();
                }
            }
            @Override
            public void onFailure(Call<User> call, Throwable t) {
                setLoading(false);
                Toast.makeText(ProfileActivity.this,
                        "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void confirmDeactivate() {
        new AlertDialog.Builder(this)
                .setTitle("Deactivate account")
                .setMessage("Are you sure? You will be logged out. Reactivation is handled by backoffice.")
                .setPositiveButton("Deactivate", (d, w) -> deactivateAccount())
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void deactivateAccount() {
        setLoading(true);
        api.deactivateAccount(bearer).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> res) {
                setLoading(false);
                if (res.isSuccessful()) {
                    Toast.makeText(ProfileActivity.this,
                            "Account deactivated", Toast.LENGTH_LONG).show();
                    SessionManager.clear(ProfileActivity.this);
                    goToLogin();
                } else if (res.code() == 401) {
                    SessionManager.clear(ProfileActivity.this);
                    goToLogin();
                } else {
                    Toast.makeText(ProfileActivity.this,
                            "Deactivate failed (" + res.code() + ")",
                            Toast.LENGTH_LONG).show();
                }
            }
            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                setLoading(false);
                Toast.makeText(ProfileActivity.this,
                        "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void setLoading(boolean loading) {
        progress.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnSave.setEnabled(!loading);
        btnDeactivate.setEnabled(!loading);
    }

    private String s(EditText e) { return e.getText().toString().trim(); }
    private String n(String v) { return v == null ? "" : v; }

    private void goToLogin() {
        startActivity(new Intent(this, EVOwnerLoginActivity.class));
        finish();
    }
}