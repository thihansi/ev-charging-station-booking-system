using EVChargingSystem.Api.Configurations;
using EVChargingSystem.Api.Repositories;
using EVChargingSystem.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MongoDB - used by all services
builder.Services.AddSingleton<MongoDbContext>();

// JWT Configuration - needs to be before services that depend on it
var jwtConfig = builder.Configuration.GetSection("Jwt").Get<JwtConfig>();
if (jwtConfig == null)
{
    throw new InvalidOperationException("JWT configuration is missing from appsettings.json");
}
builder.Services.AddSingleton(jwtConfig);

// Services - Order matters for dependency injection
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEVOwnerService, EVOwnerService>();
builder.Services.AddScoped<IGoogleMapsService, GoogleMapsService>();
builder.Services.AddScoped<IQRCodeService, QRCodeService>(); // Add QR code service
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IChargingStationService, ChargingStationService>(); // Moved after BookingService

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig.Issuer,
            ValidAudience = jwtConfig.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig.Key))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("BackofficeOnly", policy => policy.RequireRole("Backoffice"));
    options.AddPolicy("StationOperatorOnly", policy => policy.RequireRole("StationOperator"));
    options.AddPolicy("EVOwnerOnly", policy => policy.RequireRole("EVOwner"));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();