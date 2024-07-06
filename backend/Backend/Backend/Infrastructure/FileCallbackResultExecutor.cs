using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Net.Http.Headers;

namespace Backend.Infrastructure;

public sealed class FileCallbackResultExecutor : FileResultExecutorBase
{
    public FileCallbackResultExecutor(ILoggerFactory loggerFactory)
        : base(CreateLogger<FileCallbackResultExecutor>(loggerFactory))
    {
    }

    public async Task ExecuteAsync(ActionContext context, FileCallbackResult result)
    {
        try
        {
            var (range, _, serveBody) = SetHeadersAndLog(context, result, result.FileSize, result.FileSize.HasValue);

            if (!string.IsNullOrWhiteSpace(result.FileDownloadName) && result.SendInline)
            {
                var headerValue = new ContentDispositionHeaderValue("inline");

                headerValue.SetHttpFileName(result.FileDownloadName);

                context.HttpContext.Response.Headers[HeaderNames.ContentDisposition] = headerValue.ToString();
            }

            if (serveBody)
            {
                await result.Callback(
                    context.HttpContext.Response.Body,
                    context.HttpContext,
                    context.HttpContext.RequestAborted);
            }
        }
        catch (OperationCanceledException)
        {
            return;
        }
        catch (Exception e)
        {
            if (!context.HttpContext.Response.HasStarted && result.ErrorAs404)
            {
                context.HttpContext.Response.Headers.Clear();
                context.HttpContext.Response.StatusCode = 404;

                Logger.LogCritical(new EventId(99), e, "Failed to send result.");
            }
            else
            {
                throw;
            }
        }
    }
}
