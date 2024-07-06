namespace Backend.Model;

public sealed class EventNotifier : IEventNotifier
{
    private readonly HashSet<Subscription> subscriptions = [];

    public class Subscription(EventNotifier notifier, Action action) : IDisposable
    {
        private readonly EventNotifier notifier = notifier;

        public void Notify()
        {
            action();
        }

        public void Dispose()
        {
            notifier.subscriptions.Remove(this);
        }
    }

    public void Notify()
    {
        foreach (var subscription in subscriptions)
        {
            subscription.Notify();
        }
    }

    public IDisposable SubscribeAsync(Action action)
    {
        var subscription = new Subscription(this, action);

        subscriptions.Add(subscription);
        return subscription;
    }
}
