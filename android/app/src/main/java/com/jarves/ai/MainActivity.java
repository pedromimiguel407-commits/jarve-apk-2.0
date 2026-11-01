package com.jarves.ai;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String PREFS = "jarves";
    private static final String KEY_URL = "server_url";
    private static final String KEY_LAUNCHER_ICON = "launcher_icon";
    private static final int PICK_FILE_REQUEST = 7412;
    private WebView webView;
    private TextView loading;
    private String serverOrigin = "";
    private ValueCallback<Uri[]> fileChooserCallback;

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
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        webView.addJavascriptInterface(new NativeSettingsBridge(), "JarvesAndroid");
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
                fileChooserCallback = callback;
                Intent intent = params.createIntent();
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                try {
                    startActivityForResult(Intent.createChooser(intent, "Escolha a imagem da IA"), PICK_FILE_REQUEST);
                    return true;
                } catch (android.content.ActivityNotFoundException error) {
                    fileChooserCallback = null;
                    callback.onReceiveValue(null);
                    Toast.makeText(MainActivity.this, "Nenhum seletor de imagens disponível.", Toast.LENGTH_LONG).show();
                    return false;
                }
            }
        });
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

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != PICK_FILE_REQUEST || fileChooserCallback == null) return;
        Uri[] results = null;
        if (resultCode == RESULT_OK && data != null && data.getData() != null) results = new Uri[]{data.getData()};
        fileChooserCallback.onReceiveValue(results);
        fileChooserCallback = null;
    }

    public final class NativeSettingsBridge {
        @JavascriptInterface public String getLauncherIcon() {
            return getPreferences(MODE_PRIVATE).getString(KEY_LAUNCHER_ICON, "default");
        }

        @JavascriptInterface public boolean setLauncherIcon(String requestedIcon) {
            if (!"default".equals(requestedIcon) && !"robot".equals(requestedIcon)) return false;
            String selected = "robot".equals(requestedIcon) ? ".RobotLauncher" : ".DefaultLauncher";
            String disabled = "robot".equals(requestedIcon) ? ".DefaultLauncher" : ".RobotLauncher";
            PackageManager manager = getPackageManager();
            manager.setComponentEnabledSetting(
                new ComponentName(MainActivity.this, getPackageName() + selected),
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            );
            manager.setComponentEnabledSetting(
                new ComponentName(MainActivity.this, getPackageName() + disabled),
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            );
            getPreferences(MODE_PRIVATE).edit().putString(KEY_LAUNCHER_ICON, requestedIcon).apply();
            return true;
        }
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
