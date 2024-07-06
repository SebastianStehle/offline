using Backend.Infrastructure;
using Backend.Model;
using Backend.Model.MongoDb;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.UseOneOfForPolymorphism();
    options.SelectDiscriminatorNameUsing(_ => "$type");
});

builder.Services.AddSingleton<IMongoClient>(c =>
{
    return new MongoClient("mongodb://localhost:27017");
});

builder.Services.AddSingleton(c =>
{
    return c.GetRequiredService<IMongoClient>().GetDatabase("sync");
});

builder.Services.AddSingleton<IEventStore, MongoDbEventStore>();
builder.Services.AddSingleton<IEventNotifier, EventNotifier>();
builder.Services.AddSingleton<IEventProcessor, EventProcessor>();
builder.Services.AddSingleton<ITodoStore, MongoDbTodoStore>();
builder.Services.AddSingleton<ITodoRepository, TodoRepository>();
builder.Services.AddSingleton<FileCallbackResultExecutor>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseCors(builder => builder
    .SetIsOriginAllowed(x => true)
    .AllowCredentials()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
