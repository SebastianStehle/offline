namespace Backend.Model;

public sealed class EventProcessor : IEventProcessor
{
    private readonly ITodoRepository todoRepository;
    private readonly IEventStore eventStore;
    private readonly IEventNotifier eventNotifier;

    public EventProcessor(
        ITodoRepository todoRepository,
        IEventStore eventStore,
        IEventNotifier eventNotifier)
    {
        this.todoRepository = todoRepository;
        this.eventStore = eventStore;
        this.eventNotifier = eventNotifier;
    }

    public async Task ApplyAsync(List<EventBase> events)
    {
        var isChanged = false;
        foreach (var @event in events)
        {
            var isAdded = await eventStore.InsertAsync(@event);

            if (isAdded)
            {
                await todoRepository.ApplyEventAsync(@event);
                isChanged = true;
            }
        }
        
        if (isChanged)
        {
            eventNotifier.Notify();
        }
    }
}
