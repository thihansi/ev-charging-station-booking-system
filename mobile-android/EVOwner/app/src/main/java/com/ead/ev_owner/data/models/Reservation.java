package com.ead.ev_owner.data.models;

/**
 * Model class representing an EV charging reservation.
 * Mirrors the structure of the reservation table in SQLite and the server-side API.
 */
public class Reservation {

    // === Fields ===
    private String id;           // Reservation ID (server-generated)
    private String nic;          // NIC of the EV owner who made the reservation
    private String stationId;    // ID of the charging station
    private long startTs;        // Start time (epoch milliseconds)
    private long endTs;          // End time (epoch milliseconds)
    private String status;       // PENDING, APPROVED, COMPLETED, CANCELLED, REJECTED
    private String qrPayload;    // QR code payload once approved
    private long updatedAt;      // Last update timestamp (for sync)

    // === Constructors ===
    public Reservation() {
        // Default constructor required for database and JSON parsing
    }

    public Reservation(String id, String nic, String stationId, long startTs, long endTs,
                       String status, String qrPayload, long updatedAt) {
        this.id = id;
        this.nic = nic;
        this.stationId = stationId;
        this.startTs = startTs;
        this.endTs = endTs;
        this.status = status;
        this.qrPayload = qrPayload;
        this.updatedAt = updatedAt;
    }

    // === Getters and Setters ===
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }

    public long getStartTs() {
        return startTs;
    }

    public void setStartTs(long startTs) {
        this.startTs = startTs;
    }

    public long getEndTs() {
        return endTs;
    }

    public void setEndTs(long endTs) {
        this.endTs = endTs;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getQrPayload() {
        return qrPayload;
    }

    public void setQrPayload(String qrPayload) {
        this.qrPayload = qrPayload;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }

    // === Utility ===
    @Override
    public String toString() {
        return "Reservation{" +
                "id='" + id + '\'' +
                ", nic='" + nic + '\'' +
                ", stationId='" + stationId + '\'' +
                ", startTs=" + startTs +
                ", endTs=" + endTs +
                ", status='" + status + '\'' +
                ", qrPayload='" + qrPayload + '\'' +
                ", updatedAt=" + updatedAt +
                '}';
    }
}