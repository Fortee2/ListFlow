using ListFlow.Business.SalesChannels;
using ListFlow.Business.Services;
using ListFlow.Business.Services.Interfaces;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure;
using ListFlow.Infrastructure.Repository;
using ListFlow.Infrastructure.Repository.Interface;
using ListFlow.OpenAI;
using ListFlow.OpenAI.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Swashbuckle.AspNetCore.Swagger;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ListFlow", Version = "v1" });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DBConnection");
    if (connectionString != null)
    {
        options.UseMySQL(connectionString);
    }
});

builder.Services.AddSingleton<IPromptService>(new PromptService(
    builder.Configuration.GetValue<string>("OpenAI:ApiKey") ?? ""
));

builder.Services.AddScoped<ISalesChannelRepository,SalesChannelRepository>();
builder.Services.AddScoped<IListingRepository, ListingRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
builder.Services.AddScoped<IListingMetricRepository, ListingMetricRepository>();
builder.Services.AddScoped<BaseRepository<Postage>, PostageRepository>();
builder.Services.AddScoped<IImageRepository, ImageRepository>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IListingService, ListingService>();
builder.Services.AddScoped<ISalesChannelService, SalesChannelService>();
builder.Services.AddScoped<IBasicService<Inventory>, InventoryService>();
builder.Services.AddScoped<IBasicService<Postage>, PostageService>();
builder.Services.AddScoped<IListingMetricService, ListingMetricService>();
builder.Services.AddScoped<IBasicService<Postage>, PostageService>();
builder.Services.AddScoped<IImageService, ImageService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("mypolicy", ops =>
    {
        ops.AllowAnyOrigin();
        ops.AllowAnyMethod();
        ops.AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("mypolicy");

app.UseSwagger();

app.UseSwaggerUI(options => // UseSwaggerUI is called only in Development.
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = string.Empty;
});

app.UseFileServer();

app.UseRouting();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
});

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

