#pragma warning disable MA0048 // File name must match type name

using Microsoft.AspNetCore.Mvc;

namespace Backend.Infrastructure;

public delegate Task FileCallback(Stream body, HttpContext httpContext,
        CancellationToken ct);

public sealed class FileCallbackResult : FileResult
{
    public bool ErrorAs404 { get; set; }

    public bool SendInline { get; set; }

    public long? FileSize { get; set; }

    public FileCallback Callback { get; }

    public FileCallbackResult(string contentType, FileCallback callback)
        : base(contentType)
    {
        Callback = callback;
    }

    public override Task ExecuteResultAsync(ActionContext context)
    {
        var executor = context.HttpContext.RequestServices.GetRequiredService<FileCallbackResultExecutor>();

        return executor.ExecuteAsync(context, this);
    }
}
