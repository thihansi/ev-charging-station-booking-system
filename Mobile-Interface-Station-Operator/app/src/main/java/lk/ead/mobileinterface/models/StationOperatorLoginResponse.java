package lk.ead.mobileinterface.models;

public class StationOperatorLoginResponse {
    private String token;   // or "jwtToken" if API returns that field
    private String username;
    private String fullName;
    private String role;

    // Getters
    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
}
