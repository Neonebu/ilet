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
app.Use(async (context, next) =>
{
    if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
    {
        var token = context.Request.Query["token"].ToString(); // 👈 token query string'den alınır
        if (string.IsNullOrWhiteSpace(token))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Token missing in query");
            return;
        }
        var userId = JwtTokenHelper.ExtractUserId(token);
        if (userId == null)
        {
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
app.Map("/ws", wsApp =>
{
    wsApp.Run(async context =>
    {
        if (!context.WebSockets.IsWebSocketRequest)
        {
            context.Response.StatusCode = 400;
            return;
        }

        var token = context.Request.Query["token"].ToString();
        if (string.IsNullOrWhiteSpace(token))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsync("Token missing");
            return;
        }

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);
        var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "nameid");
        if (userIdClaim == null)
        {
            context.Response.StatusCode = 400;
            return;
        }

        var userId = int.Parse(userIdClaim.Value);
        var socket = await context.WebSockets.AcceptWebSocketAsync();
        await WebSocketHandler.HandleConnection(userId, socket);
    });
});
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
