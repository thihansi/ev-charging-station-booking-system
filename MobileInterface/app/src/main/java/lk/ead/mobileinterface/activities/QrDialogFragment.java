package lk.ead.mobileinterface.activities;

import android.app.Dialog;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.util.Base64;
import android.view.LayoutInflater;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.DialogFragment;

import lk.ead.mobileinterface.R;

public class QrDialogFragment extends DialogFragment {

    private static final String ARG_QR = "arg_qr";

    public static QrDialogFragment newInstance(String qrHtmlOrBase64) {
        QrDialogFragment f = new QrDialogFragment();
        Bundle b = new Bundle();
        b.putString(ARG_QR, qrHtmlOrBase64);
        f.setArguments(b);
        return f;
    }

    @NonNull @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        View v = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_qr, null, false);
        ImageView img = v.findViewById(R.id.imgQr);
        WebView web = v.findViewById(R.id.webQr);
        Button btnClose = v.findViewById(R.id.btnClose);

        String payload = getArguments() != null ? getArguments().getString(ARG_QR) : null;
        if (payload == null || payload.trim().isEmpty()) {
            Toast.makeText(requireContext(), "No QR to display", Toast.LENGTH_SHORT).show();
        } else {
            // 1) If it’s HTML (e.g., <img src="data:image/png;base64,..."> or <svg>…)
            if (looksLikeHtml(payload)) {
                web.setVisibility(View.VISIBLE);
                WebSettings s = web.getSettings();
                s.setJavaScriptEnabled(false);
                s.setSupportZoom(true);
                s.setBuiltInZoomControls(true);
                s.setDisplayZoomControls(false);
                web.loadDataWithBaseURL(
                        null,
                        payload,
                        "text/html",
                        "utf-8",
                        null
                );
            } else {
                // 2) Otherwise, assume Base64 (optionally with data URL prefix)
                try {
                    String b64 = stripDataUrlPrefix(payload);
                    byte[] bytes = Base64.decode(b64, Base64.DEFAULT);
                    Bitmap bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                    img.setImageBitmap(bmp);
                    img.setVisibility(View.VISIBLE);
                } catch (Exception e) {
                    e.printStackTrace();
                    Toast.makeText(requireContext(), "Failed to decode QR image", Toast.LENGTH_LONG).show();
                }
            }
        }

        btnClose.setOnClickListener(v1 -> dismiss());

        return new AlertDialog.Builder(requireContext())
                .setView(v)
                .create();
    }

    private boolean looksLikeHtml(String s) {
        String t = s.trim().toLowerCase();
        return t.startsWith("<html") || t.contains("<img") || t.contains("<svg");
    }

    private String stripDataUrlPrefix(String s) {
        // handles: data:image/png;base64,XXXXX
        int comma = s.indexOf(',');
        if (s.startsWith("data:") && comma >= 0) return s.substring(comma + 1);
        return s;
    }
}