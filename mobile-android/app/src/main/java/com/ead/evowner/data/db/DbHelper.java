package com.ead.evowner.data.db;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

/**
 * Central database helper for the EV Owner app.
 * Creates and manages all local SQLite tables: owner, session, reservation, station_cache
 */
public class DbHelper extends SQLiteOpenHelper {

    private static final String DB_NAME = "evowner.db";
    private static final int DB_VER = 1;

    public DbHelper(Context ctx) {
        super(ctx, DB_NAME, null, DB_VER);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {

        // === OWNER TABLE ===
        db.execSQL("CREATE TABLE owner (" +
                "nic TEXT PRIMARY KEY, " +
                "full_name TEXT NOT NULL, " +
                "email TEXT, " +
                "phone TEXT, " +
                "is_active INTEGER NOT NULL DEFAULT 1, " +
                "updated_at INTEGER)");

        // === SESSION TABLE ===
        db.execSQL("CREATE TABLE session (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "role TEXT NOT NULL, " +
                "nic TEXT, " +
                "token TEXT NOT NULL, " +
                "created_at INTEGER)");

        // === RESERVATION TABLE ===
        db.execSQL("CREATE TABLE reservation (" +
                "id TEXT PRIMARY KEY, " +
                "nic TEXT NOT NULL, " +
                "station_id TEXT NOT NULL, " +
                "start_ts INTEGER NOT NULL, " +
                "end_ts INTEGER NOT NULL, " +
                "status TEXT NOT NULL, " +
                "qr_payload TEXT, " +
                "updated_at INTEGER)");

        // === STATION CACHE TABLE ===
        db.execSQL("CREATE TABLE station_cache (" +
                "station_id TEXT PRIMARY KEY, " +
                "name TEXT, " +
                "lat REAL, " +
                "lng REAL, " +
                "type TEXT, " +
                "available_slots INTEGER, " +
                "updated_at INTEGER)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Drop all tables and recreate (simple approach for version 1)
        db.execSQL("DROP TABLE IF EXISTS owner");
        db.execSQL("DROP TABLE IF EXISTS session");
        db.execSQL("DROP TABLE IF EXISTS reservation");
        db.execSQL("DROP TABLE IF EXISTS station_cache");
        onCreate(db);
    }
}