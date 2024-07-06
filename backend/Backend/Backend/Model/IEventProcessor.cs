
namespace Backend.Model
{
    public interface IEventProcessor
    {
        Task ApplyAsync(List<EventBase> events);
    }
}