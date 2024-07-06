
namespace Backend.Model
{
    public interface IEventNotifier
    {
        void Notify();

        IDisposable SubscribeAsync(Action action);
    }
}