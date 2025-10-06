using EVChargingAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Bind DB settings for each service
builder.Services.Configure<UserDbSettings>(builder.Configuration.GetSection("UserDatabase"));
builder.Services.Configure<EVOwnerDbSettings>(builder.Configuration.GetSection("EVOwnerDatabase"));
builder.Services.Configure<StationDbSettings>(builder.Configuration.GetSection("StationDatabase"));
builder.Services.Configure<ReservationDbSettings>(builder.Configuration.GetSection("ReservationDatabase"));

builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<EVOwnerService>();
builder.Services.AddSingleton<StationService>();
builder.Services.AddSingleton<ReservationService>();
builder.Services.AddSingleton<AuthService>();

// JWT
var jwtSection = builder.Configuration.GetSection("JwtSettings");
var secret = jwtSection.GetValue<string>("Secret");
var issuer = jwtSection.GetValue<string>("Issuer");
var audience = jwtSection.GetValue<string>("Audience");
var keyBytes = Encoding.UTF8.GetBytes(secret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
