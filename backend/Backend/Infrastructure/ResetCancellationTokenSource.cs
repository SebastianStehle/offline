namespace Backend.Infrastructure;

public class ResetCancellationTokenSource : IDisposable
{
    private CancellationTokenSource cts = new();

    public CancellationToken Token => cts.Token;

    public void Dispose()
    {
        cts.Dispose();
    }

    public void Reset()
    {
        cts.Dispose();
        cts = new CancellationTokenSource();
    }

    public void Cancel()
    {
        cts.Cancel();
    }
}
