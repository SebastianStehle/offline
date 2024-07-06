namespace Backend.Model;

public interface IEventStore
{
    Task<bool> InsertAsync(EventBase @event);

    IAsyncEnumerable<EventBase> GetAsync(long afterTimestamp,
        CancellationToken ct);
}
