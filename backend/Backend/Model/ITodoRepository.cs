namespace Backend.Model;

public interface ITodoRepository
{
    Task<SyncResult> ApplyEventAsync(EventBase @event);
}