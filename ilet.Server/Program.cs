using System;
using ilet.Server.Context;
using ilet.Server.Interfaces;
using IletApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using IletApi.Repo;
using Microsoft.Extensions.FileProviders;
using ilet.Server.Services;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://*:{Environment.GetEnvironmentVariable("PORT") ?? "8080"}");

var config = builder.Configuration;
var connectionString = config.GetConnectionString("DefaultConnection");
Console.WriteLine($"[DEBUG] Connection string -> {connectionString}");

var allowedOrigins = new[]
{
    "https://localhost:54550",
    "https://ilet.onrender.com"
};

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});


// JWT Auth
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = "yourapp",
            ValidAudience = "yourapp",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("V3ry_Str0ng_S3cret_Key_123456789!@#"))
        };
    });

// Servisler
builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IUsersService, UserService>();
builder.Services.AddScoped(typeof(IRepositoryDb<>), typeof(RepositoryDb<>));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAutoMapper(typeof(Program));
var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole() // Terminal çıktısı
        .AddDebug()   // VS Output paneline de dene
        .SetMinimumLevel(LogLevel.Information);
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
        .UseLoggerFactory(loggerFactory)
        .EnableSensitiveDataLogging()
);

var app = builder.Build();

// Middleware pipeline
app.UseCors(); // DefaultPolicy çalışır
app.UseDeveloperExceptionPage();
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration skipped or failed gracefully: {ex.Message}");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseWebSockets();
app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        var socket = await context.WebSockets.AcceptWebSocketAsync();
        await WebSocketHandler.HandleConnection(socket);
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
