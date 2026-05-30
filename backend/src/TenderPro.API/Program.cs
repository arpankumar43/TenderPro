using Microsoft.EntityFrameworkCore;
using TenderPro.Application.Interfaces;
using TenderPro.Application.Services;
using TenderPro.Infrastructure.AI;
using TenderPro.Infrastructure.Data;
using TenderPro.Infrastructure.Data.Repositories;
using TenderPro.Infrastructure.Storage;

var builder = WebApplication.CreateBuilder(args);

// ── Database ────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<TenderProDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// ── HTTP Client (for Gemini) ─────────────────────────────────────────────────
builder.Services.AddHttpClient("Gemini", client =>
{
    client.Timeout = TimeSpan.FromMinutes(3);
});

// ── Application Services ─────────────────────────────────────────────────────
builder.Services.AddScoped<ITenderRepository, TenderRepository>();
builder.Services.AddScoped<IAiAnalysisService, GeminiAnalysisService>();
builder.Services.AddScoped<IFileStorageService, LocalFileStorageService>();
builder.Services.AddScoped<TenderProcessingService>();

// ── API Infrastructure ───────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "TenderPro API", Version = "v1" });
});

// ── CORS (allow Next.js dev server) ─────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// ── Auto-migrate on startup ──────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TenderProDbContext>();
    db.Database.Migrate();
}

// ── Middleware Pipeline ──────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
