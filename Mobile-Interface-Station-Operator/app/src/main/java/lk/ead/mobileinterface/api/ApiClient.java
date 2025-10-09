package lk.ead.mobileinterface.api;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {

    // Base URL of your hosted Web API
    private static final String BASE_URL = "https://it223-hvhwgha5b2h5gbcg.southindia-01.azurewebsites.net/";

    private static Retrofit retrofit;

    // Singleton pattern — create the client once
    public static Retrofit getClient() {
        if (retrofit == null) {
            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create()) // to parse JSON automatically
                    .build();
        }
        return retrofit;
    }
}