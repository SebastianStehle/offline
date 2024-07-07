
namespace Backend.Model
{
    public interface IEventNotifier
    {
        void Notify();

        ValueTask<IAsyncDisposable> SubscribeAsync(Action action);
    }
}