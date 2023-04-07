using ListFlow.OpenAI;
using ListFlow.OpenAI.Interfaces;
using Microsoft.AspNetCore.HttpLogging;
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

builder.Services.AddHttpLogging(options =>
{
    options.LoggingFields = loggingFields;
});

builder.Services.AddSingleton<IPromptService>(new PromptService(
    builder.Configuration.GetValue<string>("OpenAI:ApiKey")
));

var app = builder.Build();



app.UseHttpLogging();

app.UseFileServer();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

