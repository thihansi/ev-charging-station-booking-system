package lk.ead.mobileinterface.models;

import com.google.gson.annotations.SerializedName;

public class CreateBookingRequest {

    @SerializedName("id")
    private String id;  // optional – server may ignore, send null or UUID.randomUUID()

    @SerializedName("evOwnerNIC")
    private String evOwnerNIC;

    @SerializedName("chargingStationId")
    private String chargingStationId;

    @SerializedName("bookingDate")
    private String bookingDate; // now()

    @SerializedName("reservationDateTime")
    private String reservationDateTime; // user-picked

    @SerializedName("status")
    private int status = 0; // 0 = Pending

    @SerializedName("isActive")
    private boolean isActive = true;

    @SerializedName("qrCode")
    private String qrCode = null; // optional

    @SerializedName("approvedBy")
    private String approvedBy = null; // optional

    @SerializedName("approvedAt")
    private String approvedAt = null; // optional

    @SerializedName("rejectionReason")
    private String rejectionReason = null; // optional

    public CreateBookingRequest(String evOwnerNIC, String chargingStationId, String reservationDateTime) {
        this.evOwnerNIC = evOwnerNIC;
        this.chargingStationId = chargingStationId;
        this.reservationDateTime = reservationDateTime;
        this.bookingDate = getNowUtc();
        this.id = java.util.UUID.randomUUID().toString(); // can be sent, server may ignore
    }

    private String getNowUtc() {
        java.text.SimpleDateFormat sdf =
                new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US);
        sdf.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
        return sdf.format(new java.util.Date());
    }

    // Getters (optional)
    public String getEvOwnerNIC() { return evOwnerNIC; }
    public String getChargingStationId() { return chargingStationId; }
    public String getReservationDateTime() { return reservationDateTime; }

    public void setEvOwnerNIC(String evOwnerNIC) {
        this.evOwnerNIC = evOwnerNIC;
    }
}