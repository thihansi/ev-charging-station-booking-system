package lk.ead.mobileinterface.models;

import com.google.gson.annotations.SerializedName;
import lk.ead.mobileinterface.enumeration.BookingStatus;

public class Booking {

    @SerializedName("id")
    private int id;                          // Unique booking ID

    @SerializedName("evOwnerNic")
    private String evOwnerNic;               // NIC of the EV owner

    @SerializedName("chargingStationId")
    private String chargingStationId;           // Station ID (foreign key)

    @SerializedName("bookingDate")
    private String bookingDate;              // Date when booking was created

    @SerializedName("reservationDateTime")
    private String reservationDateTime;      // Reserved date/time for charging

    @SerializedName("status")
    private BookingStatus status;            // Booking status (Pending, Approved, etc.)

    @SerializedName("isActive")
    private boolean isActive;                // Whether booking is currently active

    @SerializedName("qrCode")
    private String qrCode;                   // Base64 QR code (if approved)

    @SerializedName("approvedBy")
    private String approvedBy;               // Operator who approved (if any)

    @SerializedName("approvedAt")
    private String approvedAt;               // Approval timestamp

    @SerializedName("rejectionReason")
    private String rejectionReason;          // Reason if rejected

    // Empty constructor (required for JSON parsing)
    public Booking() {}

    // All-args constructor
    public Booking(int id, String evOwnerNic, String chargingStationId,
                   String bookingDate, String reservationDateTime,
                   BookingStatus status, boolean isActive, String qrCode,
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

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getEvOwnerNic() { return evOwnerNic; }
    public void setEvOwnerNic(String evOwnerNic) { this.evOwnerNic = evOwnerNic; }

    public String getChargingStationId() { return chargingStationId; }
    public void setChargingStationId(String chargingStationId) { this.chargingStationId = chargingStationId; }

    public String getBookingDate() { return bookingDate; }
    public void setBookingDate(String bookingDate) { this.bookingDate = bookingDate; }

    public String getReservationDateTime() { return reservationDateTime; }
    public void setReservationDateTime(String reservationDateTime) { this.reservationDateTime = reservationDateTime; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

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
                "id=" + id +
                ", evOwnerNic='" + evOwnerNic + '\'' +
                ", chargingStationId=" + chargingStationId +
                ", bookingDate='" + bookingDate + '\'' +
                ", reservationDateTime='" + reservationDateTime + '\'' +
                ", status=" + (status != null ? status.toString() : "Unknown") +
                ", isActive=" + isActive +
                ", qrCode='" + qrCode + '\'' +
                ", approvedBy='" + approvedBy + '\'' +
                ", approvedAt='" + approvedAt + '\'' +
                ", rejectionReason='" + rejectionReason + '\'' +
                '}';
    }
}