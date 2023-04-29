using ListFlow.Infrastructure;
using ListFlow.Infrastructure.Repository;
using ListFlow.Infrastructure.Repository.Interface;
using ListFlow.OpenAI;
using ListFlow.OpenAI.Interfaces;
using Microsoft.AspNetCore.HttpLogging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();


var loggingFields = HttpLoggingFields.RequestPropertiesAndHeaders |
                                    HttpLoggingFields.ResponsePropertiesAndHeaders |
                                    HttpLoggingFields.ResponseStatusCode |
                                    HttpLoggingFields.RequestQuery |
                                    HttpLoggingFields.RequestBody;

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DBConnection");
    if (connectionString != null)
    {
        options.UseMySQL(connectionString);
    }
});

builder.Services.AddHttpLogging(options =>
{
    // ...
});


builder.Services.AddHttpLogging(options =>
{
    options.LoggingFields = loggingFields;
});

builder.Services.AddSingleton<IPromptService>(new PromptService(
    builder.Configuration.GetValue<string>("OpenAI:ApiKey") ?? ""
));

builder.Services.AddScoped<ISalesChannelRepository,SalesChannelRepository>();


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

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

