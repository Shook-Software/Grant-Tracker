namespace GrantTracker.Utilities.OnStartup
{
	public static class Swagger
	{
		public static void Setup(WebApplicationBuilder builder)
		{
			builder.Services.AddSwaggerDocument(config =>
			{
				config.PostProcess = document =>
				{
					document.Info.Version = "v1";
					document.Info.Title = "Grant Tracker API Docs";
					document.Info.Description = "Documentation for the Grant Tracker API";
					document.Info.Contact = new NSwag.OpenApiContact
					{
						Name = "Ethan Shook",
						Email = "ethan.p.shook@gmail.com"
					};
				};
			});
		}

		public static void Configure(WebApplication app)
		{
			app.UseOpenApi();
			app.UseSwaggerUi3();
		}
	}
}