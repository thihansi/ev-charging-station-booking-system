package lk.ead.mobileinterface.enumeration;

public enum StationType {
    AC(0),
    DC(1);

    private final int value;

    StationType(int value) {
        this.value = value;
    }

    public int getValue() { return value; }

    public static StationType fromInt(int value) {
        for (StationType type : StationType.values()) {
            if (type.value == value) {
                return type;
            }
        }
        return null;
    }

    @Override
    public String toString() {
        switch (this) {
            case AC: return "AC";
            case DC: return "DC";
            default: return "Unknown";
        }
    }
}