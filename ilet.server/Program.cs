using ilet.server.Context;
using ilet.server.Interfaces;
using IletApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using IletApi.Repo;
using ilet.server.Services;
using ilet.server.Helpers;
using System.Security.Claims;
using Microsoft.OpenApi.Models;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

builder.WebHost.UseUrls("http://0.0.0.0:54550");

var config = builder.Configuration;
var connectionString = config.GetConnectionString("DefaultConnection");

// ✅ CORS Policy (hem render hem local)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://ilet.onrender.com",
            "http://localhost:5173",
            "http://localhost:3000"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// 🔐 JWT Auth
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
            NameClaimType = ClaimTypes.NameIdentifier
        };
    });

// Servisler
builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IUsersService, UserService>();
builder.Services.AddScoped(typeof(IRepositoryDb<>), typeof(RepositoryDb<>));
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IFriendService, FriendService>();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddEndpointsApiExplorer();

// Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "ilet.server", Version = "v1" });
    options.EnableAnnotations();

    var uploadDocPath = Path.Combine(AppContext.BaseDirectory, "Properties", "uploadProfilePic.json");
    options.IncludeExternalSwaggerDoc(uploadDocPath);

    options.SupportNonNullableReferenceTypes();

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

    options.DocInclusionPredicate((docName, apiDesc) =>
    {
        return !apiDesc.ActionDescriptor.EndpointMetadata
            .OfType<Microsoft.AspNetCore.Mvc.ApiExplorerSettingsAttribute>()
            .Any(attr => attr.IgnoreApi);
    });

    options.OperationFilter<FormFileOperationFilter>();
    options.MapType<IFormFile>(() => new OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });
});

// EF Core + Logging
var loggerFactory = LoggerFactory.Create(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
    logging.SetMinimumLevel(LogLevel.Information);
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
           .UseLoggerFactory(loggerFactory)
           .EnableSensitiveDataLogging()
);

var app = builder.Build();

// Error detail
app.UseDeveloperExceptionPage();

// Upload klasörü varsa yoksa oluştur
var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ilet.server v1");
    c.RoutePrefix = string.Empty;
});

// WebSocket middleware aktif
app.UseWebSockets();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseRouting();

// ✅ CORS aktif edilmeli
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// WebSocket token doğrulama katmanı
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        await next();
        return;
    }

    if (context.Request.Path.StartsWithSegments("/ws") && context.WebSockets.IsWebSocketRequest)
    {
        var token = context.Request.Query["token"].ToString();

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

app.MapControllers();

app.Run();
