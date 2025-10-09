package lk.ead.mobileinterface.models;

public class Station {

    private int id;                 // Unique station ID
    private String name;            // Station name
    private String address;         // Physical address
    private double latitude;        // Latitude coordinate
    private double longitude;       // Longitude coordinate
    private String type;            // Station type (enum value from backend, e.g., "AC", "DC", "Fast")
    private int availableSlots;     // Number of available charging slots
    private String schedule;        // Operating schedule
    private boolean isActive;       // Whether the station is active

    // Empty constructor (required for JSON parsing)
    public Station() {}

    // All-args constructor
    public Station(int id, String name, String address, double latitude,
                      double longitude, String type, int availableSlots,
                      String schedule, boolean isActive) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.type = type;
        this.availableSlots = availableSlots;
        this.schedule = schedule;
        this.isActive = isActive;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(int availableSlots) { this.availableSlots = availableSlots; }

    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    // Optional: helpful for debugging
    @Override
    public String toString() {
        return "StationDto{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", type='" + type + '\'' +
                ", availableSlots=" + availableSlots +
                ", schedule='" + schedule + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
