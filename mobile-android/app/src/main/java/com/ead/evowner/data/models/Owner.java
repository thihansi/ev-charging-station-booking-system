package com.ead.evowner.data.models;

/**
 * Model class representing an EV Owner.
 * Stores user profile data both locally (SQLite) and synced from the server.
 */
public class Owner {

    // === Fields ===
    private String nic;          // Primary Key (National ID)
    private String fullName;     // Full name of the owner
    private String email;        // Contact email
    private String phone;        // Contact number
    private boolean isActive;    // Active/deactivated state (controlled by back-office)
    private long updatedAt;      // Last update timestamp (for sync)

    // === Constructors ===
    public Owner() {
        // Default empty constructor required for database & JSON mapping
    }

    public Owner(String nic, String fullName, String email, String phone, boolean isActive, long updatedAt) {
        this.nic = nic;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.isActive = isActive;
        this.updatedAt = updatedAt;
    }

    // === Getters and Setters ===
    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
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
        return "Owner{" +
                "nic='" + nic + '\'' +
                ", fullName='" + fullName + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", isActive=" + isActive +
                ", updatedAt=" + updatedAt +
                '}';
    }
}