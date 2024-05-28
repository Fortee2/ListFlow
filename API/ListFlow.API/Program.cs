using ListFlow.Business.SalesChannels;
using ListFlow.Business.Services;
using ListFlow.Business.Services.Interfaces;
using ListFlow.Domain.Model;
using ListFlow.Infrastructure;
using ListFlow.Infrastructure.Repository;
using ListFlow.Infrastructure.Repository.Interface;
using ListFlow.OpenAI;
using ListFlow.OpenAI.Interfaces;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .WriteTo.File("debug.log",Serilog.Events.LogEventLevel.Error)
);

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

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IListingService, ListingService>();
builder.Services.AddScoped<ISalesChannelService, SalesChannelService>();
builder.Services.AddScoped<IBasicService<Inventory>, InventoryService>();
builder.Services.AddScoped<IBasicService<Postage>, PostageService>();
builder.Services.AddScoped<IListingMetricService, ListingMetricService>();
builder.Services.AddScoped<IBasicService<Postage>, PostageService>();

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

app.UseHttpLogging();

app.UseFileServer();

app.UseSwagger();

app.UseSwaggerUI();

app.UseSerilogRequestLogging();

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

