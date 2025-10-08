package lk.ead.mobileinterface.utils;

import android.content.Context;

public class EVOwnerSessionManager {
    private static final String PREF = "user_session";
    private static final String KEY_TOKEN = "jwt";
    private static final String KEY_EMAIL = "email";

    public static void saveToken(Context c, String token) {
        c.getSharedPreferences(PREF, Context.MODE_PRIVATE)
                .edit().putString(KEY_TOKEN, token).apply();
    }

    public static String getToken(Context c) {
        return c.getSharedPreferences(PREF, Context.MODE_PRIVATE)
                .getString(KEY_TOKEN, null);
    }

    public static void clear(Context c) {
        c.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().clear().apply();
    }

    public static void saveEmail(Context c, String email) {
        c.getSharedPreferences(PREF, Context.MODE_PRIVATE)
                .edit().putString(KEY_EMAIL, email).apply();
    }

    public static String getEmail(Context c) {
        return c.getSharedPreferences(PREF, Context.MODE_PRIVATE)
                .getString(KEY_EMAIL, null);
    }

    private static final String KEY_NIC = "nic";
    public static void saveNic(Context c, String nic) {
        c.getSharedPreferences(PREF, Context.MODE_PRIVATE).edit().putString(KEY_NIC, nic).apply();
    }
    public static String getNic(Context c) {
        return c.getSharedPreferences(PREF, Context.MODE_PRIVATE).getString(KEY_NIC, null);
    }
}
