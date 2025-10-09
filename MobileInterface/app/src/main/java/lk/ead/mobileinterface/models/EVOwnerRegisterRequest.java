package lk.ead.mobileinterface.models;

public class EVOwnerRegisterRequest {

    private String nic;        // National ID of the EV Owner
    private String name;       // Full name
    private String email;      // Email address
    private String phone;      // Contact number
    private String password;   // Account password

    // Empty constructor (required for JSON serialization)
    public EVOwnerRegisterRequest() {}

    // All-args constructor
    public EVOwnerRegisterRequest(String nic, String name, String email, String phone, String password) {
        this.nic = nic;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "RegisterRequest{" +
                "nic='" + nic + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", password='[PROTECTED]'" +   // Hide password for logs
                '}';
    }
}
