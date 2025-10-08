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
                "id INTEGER PRIMARY KEY, " +
                "evOwnerNic TEXT, " +
                "chargingStationId INTEGER, " +
                "bookingDate TEXT, " +
                "reservationDateTime TEXT, " +
                "status TEXT, " +
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

    // -----------------------------------------------------
    // BOOKING OPERATIONS
    // -----------------------------------------------------

    public void insertBookings(List<Booking> bookings) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.beginTransaction();
        try {
            for (Booking b : bookings) {
                ContentValues values = new ContentValues();
                values.put("id", b.getId());
                values.put("evOwnerNic", b.getEvOwnerNic());
                values.put("chargingStationId", b.getChargingStationId());
                values.put("bookingDate", b.getBookingDate());
                values.put("reservationDateTime", b.getReservationDateTime());
                values.put("status", b.getStatus().toString());
                values.put("isActive", b.isActive() ? 1 : 0);
                values.put("qrCode", b.getQrCode());
                values.put("approvedBy", b.getApprovedBy());
                values.put("approvedAt", b.getApprovedAt());
                values.put("rejectionReason", b.getRejectionReason());

                db.insertWithOnConflict(TABLE_BOOKING, null, values, SQLiteDatabase.CONFLICT_REPLACE);
            }
            db.setTransactionSuccessful();
        } finally {
            db.endTransaction();
            db.close();
        }
    }

    public List<Booking> getAllBookings() {
        List<Booking> list = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT * FROM " + TABLE_BOOKING, null);

        if (cursor.moveToFirst()) {
            do {
                Booking b = new Booking();
                b.setId(cursor.getInt(cursor.getColumnIndexOrThrow("id")));
                b.setEvOwnerNic(cursor.getString(cursor.getColumnIndexOrThrow("evOwnerNic")));
                b.setChargingStationId(cursor.getInt(cursor.getColumnIndexOrThrow("chargingStationId")));
                b.setBookingDate(cursor.getString(cursor.getColumnIndexOrThrow("bookingDate")));
                b.setReservationDateTime(cursor.getString(cursor.getColumnIndexOrThrow("reservationDateTime")));
                b.setStatus(BookingStatus.valueOf(cursor.getString(cursor.getColumnIndexOrThrow("status"))));
                b.setActive(cursor.getInt(cursor.getColumnIndexOrThrow("isActive")) == 1);
                b.setQrCode(cursor.getString(cursor.getColumnIndexOrThrow("qrCode")));
                b.setApprovedBy(cursor.getString(cursor.getColumnIndexOrThrow("approvedBy")));
                b.setApprovedAt(cursor.getString(cursor.getColumnIndexOrThrow("approvedAt")));
                b.setRejectionReason(cursor.getString(cursor.getColumnIndexOrThrow("rejectionReason")));
                list.add(b);
            } while (cursor.moveToNext());
        }

        cursor.close();
        return list;
    }

    public void clearBookings() {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_BOOKING, null, null);
        db.close();
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