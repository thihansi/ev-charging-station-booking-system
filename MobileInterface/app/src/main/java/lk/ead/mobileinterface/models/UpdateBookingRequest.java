package lk.ead.mobileinterface.models;

public class UpdateBookingRequest {
    private String reservationDateTime; // ISO UTC Z

    public UpdateBookingRequest(String reservationDateTime) {
        this.reservationDateTime = reservationDateTime;
    }

    public String getReservationDateTime() { return reservationDateTime; }
    public void setReservationDateTime(String reservationDateTime) {
        this.reservationDateTime = reservationDateTime;
    }
}