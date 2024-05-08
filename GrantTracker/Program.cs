using GrantTracker.Utilities.OnStartup;
using System.Diagnostics;
using Serilog;
using Serilog.Events;
using Serilog.Formatting.Compact;
using Microsoft.AspNetCore.Hosting;

//remember that we had to install something for IIS to make it all work.. maybe
var builder = WebApplication.CreateBuilder(args);
IConfiguration configuration = builder.Configuration;
const string origins = "_allowDevOrigins";

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateBootstrapLogger();

Host.CreateDefaultBuilder(args)
       .ConfigureLogging(logging =>
       {
           logging.ClearProviders();
           logging.AddConsole();
           logging.SetMinimumLevel(LogLevel.Information);
       })
       .ConfigureWebHostDefaults(webBuilder =>
       {
           webBuilder.UseStartup<Program>();
       });

// Add services to the container.
// Any issues with listener URL is likely set in the project file itself.
JSONConverters.Setup(builder);
Swagger.Setup(builder);
DatabaseContext.Setup(builder, configuration);
MemoryCache.Setup(builder);
Auth.Setup(builder);

builder.Services.AddHttpContextAccessor();
builder.Services.AddCors(options =>
{
	options.AddPolicy(origins,
		policy =>
		{
			policy.WithOrigins("https://localhost:44395").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
            policy.WithOrigins("http://localhost:44395").AllowAnyHeader().AllowAnyMethod().AllowCredentials();
        });
});

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});
builder.Services.AddResponseCaching();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
	// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
	app.UseHsts();
}

app.UseResponseCaching();
app.UseResponseCompression();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors(origins);
Auth.Configure(app);
Swagger.Configure(app);

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();

public partial class Program { }
