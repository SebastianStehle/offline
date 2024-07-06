namespace Backend.Model;

public readonly struct SyncField<T>(T value, long ts)
{
    public long Ts { get; } = ts;

    public T Value { get; } = value;

    public SyncField(T value)
        : this(value, DateTimeOffset.UtcNow.ToUnixTimeSeconds())
    {
    }

    public static implicit operator SyncField<T>(T value)
    {
        return new SyncField<T>(value);
    }

    public static implicit operator T(SyncField<T> source)
    {
        return source.Value;
    }

    public bool CanUpdate(long ts)
    {
        return ts > Ts;
    }
}
