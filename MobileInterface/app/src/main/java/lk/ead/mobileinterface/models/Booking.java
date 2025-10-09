package lk.ead.mobileinterface.models;

import com.google.gson.annotations.SerializedName;
import lk.ead.mobileinterface.enumeration.BookingStatus;

public class Booking {

    @SerializedName("id")
    private String id; // Unique booking ID

    @SerializedName("evOwnerNIC") // ✅ matches backend JSON (case-sensitive)
    private String evOwnerNic;

    @SerializedName("chargingStationId")
    private String chargingStationId;

    @SerializedName("bookingDate")
    private String bookingDate;

    @SerializedName("reservationDateTime")
    private String reservationDateTime;

    @SerializedName("status")
    private int statusCode; // raw backend integer (0–4)

    private transient BookingStatus status;

    @SerializedName("isActive")
    private boolean isActive;

    @SerializedName("qrCode")
    private String qrCode;

    @SerializedName("approvedBy")
    private String approvedBy;

    @SerializedName("approvedAt")
    private String approvedAt;

    @SerializedName("rejectionReason")
    private String rejectionReason;

    // Empty constructor (required for Gson)
    public Booking() {}

    // All-args constructor
    public Booking(String id, String evOwnerNic, String chargingStationId,
                   String bookingDate, String reservationDateTime,
                   BookingStatus status, boolean isActive, String qrCode,
                   String approvedBy, String approvedAt, String rejectionReason) {
        this.id = id;
        this.evOwnerNic = evOwnerNic;
        this.chargingStationId = chargingStationId;
        this.bookingDate = bookingDate;
        this.reservationDateTime = reservationDateTime;
        this.status = status;
        this.statusCode = (status != null) ? status.getValue() : 0; // ensure sync
        this.isActive = isActive;
        this.qrCode = qrCode;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt;
        this.rejectionReason = rejectionReason;
    }

    // -------------------- Getters & Setters --------------------

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

    public int getStatusCode() { return statusCode; }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
        this.status = BookingStatus.fromInt(statusCode); // auto-map
    }

    public BookingStatus getStatus() {
        if (status == null) status = BookingStatus.fromInt(statusCode);
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
        this.statusCode = (status != null) ? status.getValue() : 0;
    }

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
                ", status=" + (status != null ? status.name() : "Unknown") +
                ", isActive=" + isActive +
                ", qrCode='" + qrCode + '\'' +
                ", approvedBy='" + approvedBy + '\'' +
                ", approvedAt='" + approvedAt + '\'' +
                ", rejectionReason='" + rejectionReason + '\'' +
                '}';
    }
}