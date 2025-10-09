package lk.ead.mobileinterface.db;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import lk.ead.mobileinterface.enumeration.BookingStatus;
import lk.ead.mobileinterface.models.Booking;
import lk.ead.mobileinterface.models.Station;
import lk.ead.mobileinterface.models.User;

import java.util.ArrayList;
import java.util.List;

public class DBHelper extends SQLiteOpenHelper {

    // Database Info
    private static final String DATABASE_NAME = "ev_app.db";
    private static final int DATABASE_VERSION = 1;

    // Table Names
    private static final String TABLE_USER = "users";
    private static final String TABLE_BOOKING = "bookings";
    private static final String TABLE_OPERATOR_SESSION = "operator_session";

    // Constructor
    public DBHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {

        // USER TABLE
        String CREATE_USER_TABLE = "CREATE TABLE " + TABLE_USER + " (" +
                "nic TEXT PRIMARY KEY, " +
                "name TEXT, " +
                "email TEXT, " +
                "phone TEXT, " +
                "isActive INTEGER)";
        db.execSQL(CREATE_USER_TABLE);

        // BOOKING TABLE
        String CREATE_BOOKING_TABLE = "CREATE TABLE " + TABLE_BOOKING + " (" +
                "id TEXT PRIMARY KEY, " +
                "evOwnerNic TEXT, " +
                "chargingStationId TEXT, " +
                "bookingDate TEXT, " +
                "reservationDateTime TEXT, " +
                "status INTEGER, " +
                "isActive INTEGER, " +
                "qrCode TEXT, " +
                "approvedBy TEXT, " +
                "approvedAt TEXT, " +
                "rejectionReason TEXT)";
        db.execSQL(CREATE_BOOKING_TABLE);

        // OPERATOR SESSION TABLE
        String CREATE_OPERATOR_SESSION_TABLE = "CREATE TABLE " + TABLE_OPERATOR_SESSION + " (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                "username TEXT, " +
                "token TEXT, " +
                "stationId TEXT)";
        db.execSQL(CREATE_OPERATOR_SESSION_TABLE);

    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_USER);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_BOOKING);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_OPERATOR_SESSION);
        onCreate(db);
    }

    // -----------------------------------------------------
    // USER OPERATIONS
    // -----------------------------------------------------

    public void insertOrUpdateUser(User user) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put("nic", user.getNic());
        values.put("name", user.getName());
        values.put("email", user.getEmail());
        values.put("phone", user.getPhone());
        values.put("isActive", user.isActive() ? 1 : 0);

        db.insertWithOnConflict(TABLE_USER, null, values, SQLiteDatabase.CONFLICT_REPLACE);
        db.close();
    }

    public User getUser() {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT * FROM " + TABLE_USER + " LIMIT 1", null);
        if (cursor.moveToFirst()) {
            User user = new User();
            user.setNic(cursor.getString(cursor.getColumnIndexOrThrow("nic")));
            user.setName(cursor.getString(cursor.getColumnIndexOrThrow("name")));
            user.setEmail(cursor.getString(cursor.getColumnIndexOrThrow("email")));
            user.setPhone(cursor.getString(cursor.getColumnIndexOrThrow("phone")));
            user.setActive(cursor.getInt(cursor.getColumnIndexOrThrow("isActive")) == 1);
            cursor.close();
            return user;
        }
        cursor.close();
        return null;
    }

    public void deleteUser() {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_USER, null, null);
        db.close();
    }

    // ==============================
    // BOOKING OPERATIONS (DBHelper)
    // ==============================

    // Upsert ONE booking (insert or replace by primary key "id")
    public void upsertBooking(Booking b) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues v = new ContentValues();
        v.put("id", b.getId());
        v.put("evOwnerNic", b.getEvOwnerNic());
        v.put("chargingStationId", b.getChargingStationId());
        v.put("bookingDate", b.getBookingDate());
        v.put("reservationDateTime", b.getReservationDateTime());
        v.put("status", b.getStatus());                    // int
        v.put("isActive", b.isActive() ? 1 : 0);           // boolean -> 0/1
        v.put("qrCode", b.getQrCode());
        v.put("approvedBy", b.getApprovedBy());
        v.put("approvedAt", b.getApprovedAt());
        v.put("rejectionReason", b.getRejectionReason());
        db.insertWithOnConflict(TABLE_BOOKING, null, v, SQLiteDatabase.CONFLICT_REPLACE);
        db.close();
    }

    // Replace ALL bookings in a single transaction (use after API fetch)
    public void replaceAllBookings(List<Booking> bookings) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.beginTransaction();
        try {
            db.delete(TABLE_BOOKING, null, null);
            ContentValues v = new ContentValues();
            for (Booking b : bookings) {
                v.clear();
                v.put("id", b.getId());
                v.put("evOwnerNic", b.getEvOwnerNic());
                v.put("chargingStationId", b.getChargingStationId());
                v.put("bookingDate", b.getBookingDate());
                v.put("reservationDateTime", b.getReservationDateTime());
                v.put("status", b.getStatus());
                v.put("isActive", b.isActive() ? 1 : 0);
                v.put("qrCode", b.getQrCode());
                v.put("approvedBy", b.getApprovedBy());
                v.put("approvedAt", b.getApprovedAt());
                v.put("rejectionReason", b.getRejectionReason());
                db.insertWithOnConflict(TABLE_BOOKING, null, v, SQLiteDatabase.CONFLICT_REPLACE);
            }
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
            db.close();
        }
    }

    // Get ALL bookings
    public List<Booking> getAllBookings() {
        List<Booking> list = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor c = db.rawQuery("SELECT * FROM " + TABLE_BOOKING + " ORDER BY reservationDateTime DESC", null);
        try {
            if (c.moveToFirst()) {
                do { list.add(mapBooking(c)); } while (c.moveToNext());
            }
        } finally {
            c.close();
        }
        return list;
    }

    // Get ONE booking by id
    public Booking getBookingById(String id) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor c = db.rawQuery("SELECT * FROM " + TABLE_BOOKING + " WHERE id = ?", new String[]{ id });
        try {
            if (c.moveToFirst()) return mapBooking(c);
            return null;
        } finally {
            c.close();
        }
    }

    // Update ONLY status (e.g., finalize charging -> COMPLETED)
    public void updateBookingStatus(String id, int newStatus) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues v = new ContentValues();
        v.put("status", newStatus);
        db.update(TABLE_BOOKING, v, "id = ?", new String[]{ id });
        db.close();
    }

    // Delete ONE booking
    public void deleteBookingById(String id) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_BOOKING, "id = ?", new String[]{ id });
        db.close();
    }

    // Delete ALL bookings
    public void clearBookings() {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_BOOKING, null, null);
        db.close();
    }

    // ----- Convenience queries for counts/sections (used by dashboard/reservations) -----

    // Count pending
    public int countPending() {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor c = db.rawQuery("SELECT COUNT(*) FROM " + TABLE_BOOKING + " WHERE status = 0", null);
        try { return c.moveToFirst() ? c.getInt(0) : 0; }
        finally { c.close(); }
    }

    // Count approved with reservationDateTime > now (expects ISO 'Z' strings)
    public int countApprovedFutureUtcNow() {
        String nowIso = isoNowUtc();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor c = db.rawQuery(
                "SELECT COUNT(*) FROM " + TABLE_BOOKING + " WHERE status = 1 AND reservationDateTime > ?",
                new String[]{ nowIso }
        );
        try { return c.moveToFirst() ? c.getInt(0) : 0; }
        finally { c.close(); }
    }

    // Current/Upcoming list: status in (1=Approved, 3=Charging) and date >= now
    public List<Booking> getCurrentUpcoming() {
        String nowIso = isoNowUtc();
        List<Booking> list = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor c = db.rawQuery(
                "SELECT * FROM " + TABLE_BOOKING +
                        " WHERE (status = 1 OR status = 3) AND reservationDateTime >= ?" +
                        " ORDER BY reservationDateTime ASC", new String[]{ nowIso });
        try {
            if (c.moveToFirst()) { do { list.add(mapBooking(c)); } while (c.moveToNext()); }
        } finally { c.close(); }
        return list;
    }

    // Completed list
    public List<Booking> getCompleted() {
        List<Booking> list = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor c = db.rawQuery(
                "SELECT * FROM " + TABLE_BOOKING + " WHERE status = 4 ORDER BY reservationDateTime DESC", null);
        try {
            if (c.moveToFirst()) { do { list.add(mapBooking(c)); } while (c.moveToNext()); }
        } finally { c.close(); }
        return list;
    }

    // ==============================
    // Private helpers
    // ==============================

    private Booking mapBooking(Cursor c) {
        Booking b = new Booking();
        b.setId(c.getString(c.getColumnIndexOrThrow("id")));
        b.setEvOwnerNic(c.getString(c.getColumnIndexOrThrow("evOwnerNic")));
        b.setChargingStationId(c.getString(c.getColumnIndexOrThrow("chargingStationId")));
        b.setBookingDate(c.getString(c.getColumnIndexOrThrow("bookingDate")));
        b.setReservationDateTime(c.getString(c.getColumnIndexOrThrow("reservationDateTime")));
        b.setStatus(c.getInt(c.getColumnIndexOrThrow("status")));                 // int
        b.setActive(c.getInt(c.getColumnIndexOrThrow("isActive")) == 1);
        b.setQrCode(c.getString(c.getColumnIndexOrThrow("qrCode")));
        b.setApprovedBy(c.getString(c.getColumnIndexOrThrow("approvedBy")));
        b.setApprovedAt(c.getString(c.getColumnIndexOrThrow("approvedAt")));
        b.setRejectionReason(c.getString(c.getColumnIndexOrThrow("rejectionReason")));
        return b;
    }

    // ISO now in UTC matching saved format (used for simple string comparison)
    private String isoNowUtc() {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US);
        sdf.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
        return sdf.format(new java.util.Date());
    }


    // -----------------------------------------------------
    // OPERATOR SESSION OPERATIONS
    // -----------------------------------------------------

    public void saveOperatorSession(String username, String token, String stationId) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete("operator_session", null, null); // keep only one session
        ContentValues values = new ContentValues();
        values.put("username", username);
        values.put("token", token);
        values.put("stationId", stationId);
        db.insert("operator_session", null, values);
        db.close();
    }

    public String getOperatorToken() {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT token FROM operator_session LIMIT 1", null);
        String token = null;
        if (cursor.moveToFirst()) {
            token = cursor.getString(cursor.getColumnIndexOrThrow("token"));
        }
        cursor.close();
        return token;
    }

    public void clearOperatorSession() {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete("operator_session", null, null);
        db.close();
    }

}