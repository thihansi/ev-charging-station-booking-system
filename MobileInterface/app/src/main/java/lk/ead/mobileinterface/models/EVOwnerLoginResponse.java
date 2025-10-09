package lk.ead.mobileinterface.models;

import com.google.gson.annotations.SerializedName;

public class EVOwnerLoginResponse {

    @SerializedName("token")
    private String token;

    // 👇 change from "user" → "evOwner"
    @SerializedName("evOwner")
    private User evOwner;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getEvOwner() {
        return evOwner;
    }

    public void setEvOwner(User evOwner) {
        this.evOwner = evOwner;
    }
}