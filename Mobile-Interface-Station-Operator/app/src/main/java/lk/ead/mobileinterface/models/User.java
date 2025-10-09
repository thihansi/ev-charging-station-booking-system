package lk.ead.mobileinterface.models;

public class User {

    private String nic;        // Unique National ID of the EV Owner
    private String name;       // Full name
    private String email;      // Registered email address
    private String phone;      // Contact number
    private boolean isActive;  // Account status

    // Empty constructor (required for JSON deserialization)
    public User() {}

    // All-args constructor
    public User(String nic, String name, String email, String phone, boolean isActive) {
        this.nic = nic;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.isActive = isActive;
    }

    // Getters and Setters
    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    @Override
    public String toString() {
        return "User{" +
                "nic='" + nic + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
