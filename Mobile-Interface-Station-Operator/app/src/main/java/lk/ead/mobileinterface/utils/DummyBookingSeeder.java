package lk.ead.mobileinterface.utils;

import android.content.ContentValues;
import android.content.Context;
import android.database.sqlite.SQLiteDatabase;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import lk.ead.mobileinterface.db.DBHelper;

/**
 * Insert and remove local-only dummy bookings for UI/testing.
 * All dummy rows have id starting with "DUMMY_" to allow safe cleanup.
 */
public class DummyBookingSeeder {

    private static final String TABLE_BOOKING = "bookings";

    // ISO-8601 like the API (UTC 'Z')
    private static String isoNowPlusDays(int days) {
        long millis = System.currentTimeMillis() + (long) days * 24L * 60L * 60L * 1000L;
        Date d = new Date(millis);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
        return sdf.format(d);
    }

    public static void seed(Context ctx) {
        DBHelper dbh = new DBHelper(ctx);
        SQLiteDatabase db = dbh.getWritableDatabase();

        // 1) ensure no duplicates
        db.delete(TABLE_BOOKING, "id LIKE ?", new String[] { "DUMMY_%" });

        // 2) insert a few rows (tweak as needed)
        insertDummy(db,
                "DUMMY_1",
                "2001",                                     // evOwnerNIC
                "DUMMY_STATION_A",                          // chargingStationId
                isoNowPlusDays(0),                          // bookingDate (today)
                isoNowPlusDays(0),                          // reservationDateTime (today)
                1,                                          // status = Approved (adjust to your enum mapping)
                true,
                "QR-DUMMY-1",
                "operatorA",
                isoNowPlusDays(0),
                null);

        insertDummy(db,
                "DUMMY_2",
                "2002",
                "DUMMY_STATION_B",
                isoNowPlusDays(0),
                isoNowPlusDays(1),                          // tomorrow (approved future)
                1,                                          // Approved
                true,
                "QR-DUMMY-2",
                null,
                null,
                null);

        insertDummy(db,
                "DUMMY_3",
                "2003",
                "DUMMY_STATION_C",
                isoNowPlusDays(-1),
                isoNowPlusDays(-1),                         // yesterday (already completed)
                4,                                          // Completed
                true,
                "QR-DUMMY-3",
                "operatorA",
                isoNowPlusDays(-1),
                null);

        insertDummy(db,
                "DUMMY_4",
                "2004",
                "DUMMY_STATION_D",
                isoNowPlusDays(0),
                isoNowPlusDays(0),
                0,                                          // Pending
                true,
                "QR-DUMMY-4",
                null,
                null,
                "Awaiting approval");

        db.close();
    }

    private static void insertDummy(SQLiteDatabase db,
                                    String id,
                                    String evOwnerNIC,
                                    String stationId,
                                    String bookingDate,
                                    String reservationDateTime,
                                    int status,
                                    boolean isActive,
                                    String qrCode,
                                    String approvedBy,
                                    String approvedAt,
                                    String rejectionReason) {

        ContentValues v = new ContentValues();
        v.put("id", id); // TEXT
        v.put("evOwnerNic", evOwnerNIC);
        v.put("chargingStationId", stationId); // TEXT
        v.put("bookingDate", bookingDate);
        v.put("reservationDateTime", reservationDateTime);

        // If your DB schema stores status as TEXT, do:
        // v.put("status", String.valueOf(status));
        // If it stores as INTEGER (recommended):
        v.put("status", status);

        v.put("isActive", isActive ? 1 : 0);
        v.put("qrCode", qrCode);
        v.put("approvedBy", approvedBy);
        v.put("approvedAt", approvedAt);
        v.put("rejectionReason", rejectionReason);

        db.insert(TABLE_BOOKING, null, v);
    }

    public static void clear(Context ctx) {
        DBHelper dbh = new DBHelper(ctx);
        SQLiteDatabase db = dbh.getWritableDatabase();
        db.delete(TABLE_BOOKING, "id LIKE ?", new String[] { "DUMMY_%" });
        db.close();
    }
}