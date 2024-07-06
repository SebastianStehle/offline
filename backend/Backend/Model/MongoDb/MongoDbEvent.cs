namespace Backend.Model.MongoDb;

public sealed class MongoDbEvent
{
    required public string Id { get; set; }

    required public string Json { get; set; }

    required public long Timestamp { get; set; }
}
