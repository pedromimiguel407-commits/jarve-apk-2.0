package com.jarves.ai;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String PREFS = "jarves";
    private static final String KEY_URL = "server_url";
    private WebView webView;
    private TextView loading;
    private String serverOrigin = "";

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setStatusBarColor(0xFF080D1A);
        getWindow().setNavigationBarColor(0xFF080D1A);
        buildUi();
        String saved = getPreferences(MODE_PRIVATE).getString(KEY_URL, "");
        if (saved.isEmpty()) showServerDialog();
        else loadServer(saved);
    }

    private void buildUi() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xFF080D1A);
        loading = new TextView(this);
        loading.setText("JARVES AI · Conectando...");
        loading.setTextColor(0xFFFFFFFF);
        loading.setPadding(18, 12, 18, 12);
        root.addView(loading, new LinearLayout.LayoutParams(-1, -2));
        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageStarted(WebView view, String url, Bitmap favicon) {
                loading.setVisibility(View.VISIBLE);
                loading.setText("JARVES AI · Carregando...");
            }
            @Override public void onPageFinished(WebView view, String url) {
                loading.setVisibility(View.GONE);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String targetOrigin = uri.getScheme() + "://" + uri.getAuthority();
                if (targetOrigin.equals(serverOrigin)) return false;
                if ("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme())) {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    return true;
                }
                return true;
            }
        });
        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setPadding(12, 6, 12, 6);
        TextView brand = new TextView(this);
        brand.setText("JARVES AI");
        brand.setTextColor(0xFFFFFFFF);
        brand.setTextSize(16);
        toolbar.addView(brand, new LinearLayout.LayoutParams(0, -2, 1));
        android.widget.Button serverButton = new android.widget.Button(this);
        serverButton.setText("Servidor");
        serverButton.setOnClickListener(v -> showServerDialog());
        toolbar.addView(serverButton, new LinearLayout.LayoutParams(-2, -2));
        root.addView(toolbar, new LinearLayout.LayoutParams(-1, -2));
        root.addView(webView, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(root);
    }

    private void showServerDialog() {
        final EditText input = new EditText(this);
        input.setSingleLine(true);
        input.setHint("http://192.168.1.10:3000");
        input.setText(getPreferences(MODE_PRIVATE).getString(KEY_URL, ""));
        input.setInputType(android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_URI);
        LinearLayout box = new LinearLayout(this);
        box.setPadding(24, 8, 24, 0);
        box.addView(input);
        new AlertDialog.Builder(this)
            .setTitle("Conectar ao JARVES AI")
            .setMessage("Informe o endereço do servidor JARVES. O PC e o Android devem estar na mesma rede Wi-Fi.")
            .setView(box)
            .setCancelable(false)
            .setPositiveButton("Conectar", (d, w) -> {
                String value = input.getText().toString().trim();
                if (!value.matches("^https?://[^\\s]+$")) {
                    Toast.makeText(this, "Informe um endereço http:// ou https:// válido.", Toast.LENGTH_LONG).show();
                    showServerDialog();
                    return;
                }
                loadServer(value);
            })
            .setNegativeButton("Sair", (d, w) -> finish())
            .show();
    }

    private void loadServer(String value) {
        String normalized = value.replaceAll("/+$", "");
        Uri uri = Uri.parse(normalized);
        if (uri.getHost() == null || (!"http".equals(uri.getScheme()) && !"https".equals(uri.getScheme()))) {
            showServerDialog();
            return;
        }
        serverOrigin = uri.getScheme() + "://" + uri.getAuthority();
        getPreferences(MODE_PRIVATE).edit().putString(KEY_URL, normalized).apply();
        loading.setVisibility(View.VISIBLE);
        loading.setText("Conectando a " + serverOrigin);
        webView.loadUrl(normalized);
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
