package lk.ead.mobileinterface.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SessionManager {
    private static final String PREF_NAME = "ev_session";
    private static final String KEY_TOKEN = "token";
    private static final String KEY_USERNAME = "username";

    private SharedPreferences prefs;
    private SharedPreferences.Editor editor;

    public SessionManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
    }

    public void saveSession(String username, String token) {
        editor.putString(KEY_USERNAME, username);
        editor.putString(KEY_TOKEN, token);
        editor.apply();
    }

    public String getToken() {
        return prefs.getString(KEY_TOKEN, null);
    }

    public String getUsername() {
        return prefs.getString(KEY_USERNAME, null);
    }

    public void clearSession() {
        editor.clear();
        editor.apply();
    }
}
