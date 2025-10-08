package com.ead.ev_owner.data.db;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import com.ead.ev_owner.data.models.Owner;

/**
 * DAO for the `owner` table.
 * Schema (DbHelper):
 *  owner(nic TEXT PK, full_name TEXT, email TEXT, phone TEXT, is_active INTEGER, updated_at INTEGER)
 */
public class OwnerDao {

    private static final String TBL = "owner";

    private final DbHelper helper;

    public OwnerDao(Context ctx) {
        this.helper = new DbHelper(ctx);
    }

    /* =========================
       Insert or Update (Upsert)
       ========================= */
    public long upsert(Owner o) {
        SQLiteDatabase db = helper.getWritableDatabase();
        ContentValues v = new ContentValues();
        v.put("nic", o.getNic());
        v.put("full_name", o.getFullName());
        v.put("email", o.getEmail());
        v.put("phone", o.getPhone());
        v.put("is_active", o.isActive() ? 1 : 0);
        v.put("updated_at", o.getUpdatedAt());

        // Try update first; if no row updated, insert.
        int rows = db.update(TBL, v, "nic=?", new String[]{o.getNic()});
        if (rows == 0) {
            return db.insert(TBL, null, v);
        }
        return rows; // rows affected
    }

    /* =========================
       Get by NIC (PK)
       ========================= */
    public Owner getByNic(String nic) {
        SQLiteDatabase db = helper.getReadableDatabase();
        try (Cursor c = db.query(TBL,
                new String[]{"nic","full_name","email","phone","is_active","updated_at"},
                "nic=?",
                new String[]{nic},
                null, null, null)) {
            if (c.moveToFirst()) {
                return map(c);
            }
            return null;
        }
    }

    /* =========================
       Deactivate / Activate
       ========================= */
    public int setActive(String nic, boolean active, long updatedAt) {
        SQLiteDatabase db = helper.getWritableDatabase();
        ContentValues v = new ContentValues();
        v.put("is_active", active ? 1 : 0);
        v.put("updated_at", updatedAt);
        return db.update(TBL, v, "nic=?", new String[]{nic});
    }

    /* =========================
       Delete owner (rarely needed)
       ========================= */
    public int delete(String nic) {
        SQLiteDatabase db = helper.getWritableDatabase();
        return db.delete(TBL, "nic=?", new String[]{nic});
    }

    /* =========================
       Helpers
       ========================= */
    private Owner map(Cursor c) {
        Owner o = new Owner();
        o.setNic(c.getString(c.getColumnIndexOrThrow("nic")));
        o.setFullName(c.getString(c.getColumnIndexOrThrow("full_name")));
        o.setEmail(c.getString(c.getColumnIndexOrThrow("email")));
        o.setPhone(c.getString(c.getColumnIndexOrThrow("phone")));
        o.setActive(c.getInt(c.getColumnIndexOrThrow("is_active")) == 1);
        o.setUpdatedAt(c.getLong(c.getColumnIndexOrThrow("updated_at")));
        return o;
    }
}