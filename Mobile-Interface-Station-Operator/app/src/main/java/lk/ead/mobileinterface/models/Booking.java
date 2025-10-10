package lk.ead.mobileinterface.models;

import com.google.gson.annotations.SerializedName;

public class Booking {

    private String id;                  // UUID from API
    @SerializedName("evOwnerNIC")
    private String evOwnerNic;
    private String chargingStationId;   // UUID from API
    private String bookingDate;
    private String reservationDateTime;
    private int status;                 // 0..4 from API
    private boolean isActive;
    private String qrCode;
    private String approvedBy;
    private String approvedAt;
    private String rejectionReason;

    public Booking() {}

    public Booking(String id, String evOwnerNic, String chargingStationId,
                   String bookingDate, String reservationDateTime,
                   int status, boolean isActive, String qrCode,
                   String approvedBy, String approvedAt, String rejectionReason) {
        this.id = id;
        this.evOwnerNic = evOwnerNic;
        this.chargingStationId = chargingStationId;
        this.bookingDate = bookingDate;
        this.reservationDateTime = reservationDateTime;
        this.status = status;
        this.isActive = isActive;
        this.qrCode = qrCode;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt;
        this.rejectionReason = rejectionReason;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEvOwnerNic() { return evOwnerNic; }
    public void setEvOwnerNic(String evOwnerNic) { this.evOwnerNic = evOwnerNic; }

    public String getChargingStationId() { return chargingStationId; }
    public void setChargingStationId(String chargingStationId) { this.chargingStationId = chargingStationId; }

    public String getBookingDate() { return bookingDate; }
    public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }

    public String getReservationDateTime() { return reservationDateTime; }
    public void setReservationDateTime(String reservationDateTime) { this.reservationDateTime = reservationDateTime; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    @Override
    public String toString() {
        return "Booking{" +
                "id='" + id + '\'' +
                ", evOwnerNic='" + evOwnerNic + '\'' +
                ", chargingStationId='" + chargingStationId + '\'' +
                ", bookingDate='" + bookingDate + '\'' +
                ", reservationDateTime='" + reservationDateTime + '\'' +
                ", status=" + status +
                ", isActive=" + isActive +
                ", qrCode='" + qrCode + '\'' +
                ", approvedBy='" + approvedBy + '\'' +
                ", approvedAt='" + approvedAt + '\'' +
                ", rejectionReason='" + rejectionReason + '\'' +
                '}';
    }
}