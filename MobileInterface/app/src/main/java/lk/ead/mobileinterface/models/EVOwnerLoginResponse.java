package lk.ead.mobileinterface.models;

public class EVOwnerLoginResponse {
    private String token;  // JWT
    private User user;     // Logged-in EV Owner (nic, name, email, phone, isActive)

    public EVOwnerLoginResponse() {}

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}