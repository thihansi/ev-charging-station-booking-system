package lk.ead.mobileinterface.enumeration;

public enum BookingStatus {
    Pending(0),
    Approved(1),
    Rejected(2),
    Completed(3),
    Cancelled(4);

    private final int value;

    BookingStatus(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    // Convert backend int → enum
    public static BookingStatus fromInt(int value) {
        for (BookingStatus status : BookingStatus.values()) {
            if (status.value == value) {
                return status;
            }
        }
        return null;
    }

    // For display in UI (optional)
    @Override
    public String toString() {
        switch (this) {
            case Pending: return "Pending";
            case Approved: return "Approved";
            case Rejected: return "Rejected";
            case Completed: return "Completed";
            case Cancelled: return "Cancelled";
            default: return "Unknown";
        }
    }
}
