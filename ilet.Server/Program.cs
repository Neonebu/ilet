using ilet.Server.Context;
using ilet.Server.Interfaces;
using IletApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using IletApi.Repo;
using ilet.Server.Services;
using ilet.Server.Helpers;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;
var connectionString = config.GetConnectionString("DefaultConnection");
Console.WriteLine($"[DEBUG] Connection string -> {connectionString}");
var allowedOrigins = new[]
{
    "https://localhost:54550",
    "https://ilet.onrender.com",
    "https://iletapi.onrender.com"
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
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "yourapp",
            ValidAudience = "yourapp",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("V3ry_Str0ng_S3cret_Key_123456789!@#")),
            NameClaimType = ClaimTypes.NameIdentifier // 💥 Burası!
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
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors(); // DefaultPolicy çalışır
app.UseAuthentication();
app.UseAuthorization();
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
    {
        Console.WriteLine("🔌 WS isteği geldi.");

        var token = context.Request.Query["token"].ToString();
        Console.WriteLine("🔐 Gelen token: " + token);

        if (string.IsNullOrWhiteSpace(token))
        {
            Console.WriteLine("❌ Token boş.");
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Token missing in query");
            return;
        }

        var userId = JwtTokenHelper.ExtractUserId(token);
        Console.WriteLine("👤 Çekilen userId: " + userId);

        if (userId == null)
        {
            Console.WriteLine("❌ Token'dan userId çekilemedi.");
            context.Response.StatusCode = 401;
            return;
        }

        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        await WebSocketHandler.HandleConnection(userId.Value, webSocket);
    }
    else
    {
        await next();
    }
});
app.MapControllers();
var lifetime = app.Lifetime;
lifetime.ApplicationStarted.Register(() =>
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    var dataSource = app.Services.GetRequiredService<EndpointDataSource>();

    foreach (var endpoint in dataSource.Endpoints)
    {
        logger.LogInformation("📡 Route: {Route}", endpoint.DisplayName);
    }
});
app.Run();
