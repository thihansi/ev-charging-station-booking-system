package lk.ead.mobileinterface.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
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
import lk.ead.mobileinterface.models.RegisterRequest;
import lk.ead.mobileinterface.models.User;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private EditText etNic, etName, etEmail, etPhone, etPassword, etConfirmPassword;
    private Button btnCreateAccount;
    private ProgressBar progressBar;

    private ApiService api;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        // Bind views
        etNic = findViewById(R.id.etNic);
        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPhone = findViewById(R.id.etPhone);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        btnCreateAccount = findViewById(R.id.btnCreateAccount);
        progressBar = findViewById(R.id.progressBar);

        // API
        api = ApiClient.getClient().create(ApiService.class);

        btnCreateAccount.setOnClickListener(v -> attemptRegister());
    }

    private void attemptRegister() {
        // Read inputs
        String nic = s(etNic);
        String name = s(etName);
        String email = s(etEmail);
        String phone = s(etPhone);
        String password = s(etPassword);
        String confirm = s(etConfirmPassword);

        // Validate
        if (!validate(nic, name, email, phone, password, confirm)) return;

        // Build request
        RegisterRequest req = new RegisterRequest(nic, name, email, phone, password);

        // UI state
        setLoading(true);

        // Call API
        api.register(req).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> res) {
                setLoading(false);
                if (res.isSuccessful() && res.body() != null) {
                    Toast.makeText(RegisterActivity.this, "Account created! Please log in.", Toast.LENGTH_LONG).show();
                    startActivity(new Intent(RegisterActivity.this, LoginActivity.class));
                    finish();
                } else {
                    // Try to surface server message if available
                    String msg = "Registration failed (" + res.code() + ")";
                    Toast.makeText(RegisterActivity.this, msg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<User> call, Throwable t) {
                setLoading(false);
                Toast.makeText(RegisterActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private boolean validate(String nic, String name, String email, String phone, String password, String confirm) {
        if (TextUtils.isEmpty(nic)) {
            etNic.setError("NIC is required");
            etNic.requestFocus();
            return false;
        }
        if (TextUtils.isEmpty(name)) {
            etName.setError("Name is required");
            etName.requestFocus();
            return false;
        }
        if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.setError("Valid email is required");
            etEmail.requestFocus();
            return false;
        }
        if (TextUtils.isEmpty(phone) || phone.length() < 7) {
            etPhone.setError("Valid phone is required");
            etPhone.requestFocus();
            return false;
        }
        if (TextUtils.isEmpty(password) || password.length() < 6) {
            etPassword.setError("Password must be at least 6 characters");
            etPassword.requestFocus();
            return false;
        }
        if (!password.equals(confirm)) {
            etConfirmPassword.setError("Passwords do not match");
            etConfirmPassword.requestFocus();
            return false;
        }
        return true;
    }

    private void setLoading(boolean loading) {
        progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnCreateAccount.setEnabled(!loading);
    }

    private String s(EditText e) { return e.getText().toString().trim(); }
}