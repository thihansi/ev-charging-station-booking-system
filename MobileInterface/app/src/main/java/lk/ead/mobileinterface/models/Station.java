package lk.ead.mobileinterface.models;

import com.google.gson.annotations.SerializedName;
import lk.ead.mobileinterface.enumeration.StationType;

public class Station {

    @SerializedName("id")
    private String id;                  // Unique station ID

    @SerializedName("name")
    private String name;             // Station name

    @SerializedName("address")
    private String address;          // Physical address

    @SerializedName("latitude")
    private double latitude;         // Latitude coordinate

    @SerializedName("longitude")
    private double longitude;        // Longitude coordinate

    @SerializedName("type")
    private StationType type;        // Enum: AC / DC

    @SerializedName("availableSlots")
    private int availableSlots;      // Number of available charging slots

    @SerializedName("schedule")
    private String schedule;         // Operating schedule

    @SerializedName("isActive")
    private boolean isActive;        // Whether the station is active

    // Empty constructor (required for JSON parsing)
    public Station() {}

    // All-args constructor
    public Station(String id, String name, String address, double latitude,
                   double longitude, StationType type, int availableSlots,
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
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public StationType getType() { return type; }
    public void setType(StationType type) { this.type = type; }

    public int getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(int availableSlots) { this.availableSlots = availableSlots; }

    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    @Override
    public String toString() {
        return "Station{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", type=" + (type != null ? type.toString() : "Unknown") +
                ", availableSlots=" + availableSlots +
                ", schedule='" + schedule + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}