using MongoDB.Driver;
using System.Runtime.CompilerServices;
using System.Text.Json;

namespace Backend.Model.MongoDb;

public class MongoDbEventStore : IEventStore
{
    private readonly IMongoCollection<MongoDbEvent> collection;
    private readonly Task initialize;

    public MongoDbEventStore(IMongoDatabase database)
    {
        collection = database.GetCollection<MongoDbEvent>("events");

        initialize = InitializeAsync();
    }

    private async Task InitializeAsync()
    {
        await collection.Indexes.CreateOneAsync(
            new CreateIndexModel<MongoDbEvent>(
                Builders<MongoDbEvent>.IndexKeys.Ascending(x => x.Timestamp)
            ));
    }

    public async IAsyncEnumerable<EventBase> GetAsync(long afterTimestamp,
         [EnumeratorCancellation] CancellationToken ct)
    {
        await initialize;

        var cursor = await collection.Find(x => x.Timestamp > afterTimestamp).ToCursorAsync(ct);

        while (await cursor.MoveNextAsync(ct))
        {
            foreach (var document in cursor.Current)
            {
                var @event = JsonSerializer.Deserialize<EventBase>(document.Json);

                if (@event != null)
                {
                    yield return @event;
                }
            }
        }
    }

    public async Task<bool> InsertAsync(EventBase @event)
    {
        await initialize;

        var document = new MongoDbEvent
        {
            Id = @event.Metadata.EventId,
            // Use a special timestamp to create an index.
            Timestamp = @event.Metadata.Timestamp,
            // Serialize as JSON to avoid issues with discriminators.
            Json = JsonSerializer.Serialize(@event),
        };

        try
        {
            await collection.InsertOneAsync(document);
            return true;
        }
        catch (MongoWriteException ex) when (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
        {
            return false;
        }
    }
}
