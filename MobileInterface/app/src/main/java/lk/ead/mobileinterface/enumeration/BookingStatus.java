package lk.ead.mobileinterface.enumeration;

public enum BookingStatus {
    Pending(0, "Pending"),
    Approved(1, "Approved"),
    Rejected(2, "Rejected"),
    Completed(3, "Completed"),
    Cancelled(4, "Cancelled");

    private final int value;
    private final String label;

    BookingStatus(int value, String label) {
        this.value = value;
        this.label = label;
    }

    public int getValue() { return value; }
    public String getLabel() { return label; }

    public static BookingStatus fromInt(int val) {
        for (BookingStatus s : values()) {
            if (s.value == val) return s;
        }
        return Pending; // default fallback
    }
}