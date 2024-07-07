namespace Backend.Model;

public sealed class EventNotifier : IEventNotifier
{
    private readonly HashSet<Subscription> subscriptions = [];

    public class Subscription(EventNotifier notifier, Action action) : IAsyncDisposable
    {
        private readonly EventNotifier notifier = notifier;

        public void Notify()
        {
            action();
        }

        public ValueTask DisposeAsync()
        {
            notifier.subscriptions.Remove(this);
            return default;
        }
    }

    public void Notify()
    {
        foreach (var subscription in subscriptions)
        {
            subscription.Notify();
        }
    }

    public ValueTask<IAsyncDisposable> SubscribeAsync(Action action)
    {
        var subscription = new Subscription(this, action);

        subscriptions.Add(subscription);
        return new ValueTask<IAsyncDisposable>(subscription);
    }
}
