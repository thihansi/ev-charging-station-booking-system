package lk.ead.mobileinterface.activities;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

import com.google.zxing.ResultPoint;
import com.journeyapps.barcodescanner.BarcodeCallback;
import com.journeyapps.barcodescanner.BarcodeResult;
import com.journeyapps.barcodescanner.DecoratedBarcodeView;

import org.json.JSONObject;

import java.util.List;

import lk.ead.mobileinterface.R;

public class ScanQRActivity extends AppCompatActivity {

    private DecoratedBarcodeView barcodeView;
    private boolean handled = false;

    // Runtime permission launcher
    private final ActivityResultLauncher<String> cameraPermLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
                if (granted) startScanner();
                else Toast.makeText(this, "Camera permission is required to scan", Toast.LENGTH_LONG).show();
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_scan_qr);

        barcodeView = findViewById(R.id.barcode_scanner);

        // Ask for permission if needed, otherwise start camera
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED) {
            startScanner();
        } else {
            cameraPermLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void startScanner() {
        handled = false;
        barcodeView.decodeContinuous(callback);
        barcodeView.resume();
    }

    private final BarcodeCallback callback = new BarcodeCallback() {
        @Override
        public void barcodeResult(BarcodeResult result) {
            if (handled || result.getText() == null) return;

            try {
                JSONObject obj = new JSONObject(result.getText());
                String bookingId = obj.optString("BookingId", null);
                if (bookingId == null || bookingId.isEmpty()) {
                    Toast.makeText(ScanQRActivity.this, "Invalid QR", Toast.LENGTH_SHORT).show();
                    return;
                }
                handled = true;
                barcodeView.pause();

                // Go to detail screen
                startActivity(new android.content.Intent(ScanQRActivity.this, BookingDetailsActivity.class)
                        .putExtra("booking_id", bookingId));
                finish();

            } catch (Exception e) {
                Toast.makeText(ScanQRActivity.this, "QR parse error", Toast.LENGTH_SHORT).show();
            }
        }
        @Override public void possibleResultPoints(List<ResultPoint> resultPoints) {}
    };

    @Override protected void onResume() { super.onResume(); if (!handled) barcodeView.resume(); }
    @Override protected void onPause()  { barcodeView.pause(); super.onPause(); }
}