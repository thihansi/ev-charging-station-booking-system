package com.ead.evowner.data.models;

/**
 * Model class representing an EV Charging Station.
 * Used for displaying and caching station data locally in SQLite.
 */
public class Station {

    // === Fields ===
    private String stationId;        // Unique ID of the station
    private String name;             // Station name or title
    private double lat;              // Latitude
    private double lng;              // Longitude
    private String type;             // AC/DC or connector type
    private int availableSlots;      // Number of available charging slots
    private long updatedAt;          // Last updated timestamp (for cache)

    // === Constructors ===
    public Station() {
        // Default constructor for database/JSON mapping
    }

    public Station(String stationId, String name, double lat, double lng,
                   String type, int availableSlots, long updatedAt) {
        this.stationId = stationId;
        this.name = name;
        this.lat = lat;
        this.lng = lng;
        this.type = type;
        this.availableSlots = availableSlots;
        this.updatedAt = updatedAt;
    }

    // === Getters and Setters ===
    public String getStationId() {
        return stationId;
    }

    public void setStationId(String stationId) {
        this.stationId = stationId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(int availableSlots) {
        this.availableSlots = availableSlots;
    }

    public long getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(long updatedAt) {
        this.updatedAt = updatedAt;
    }

    // === Utility ===
    @Override
    public String toString() {
        return "Station{" +
                "stationId='" + stationId + '\'' +
                ", name='" + name + '\'' +
                ", lat=" + lat +
                ", lng=" + lng +
                ", type='" + type + '\'' +
                ", availableSlots=" + availableSlots +
                ", updatedAt=" + updatedAt +
                '}';
    }
}