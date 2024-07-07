using Backend.Controllers.Models;
using Backend.Infrastructure;
using Backend.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;

namespace Backend.Controllers;

[ApiController]
public class EventsController : ControllerBase
{
    private static readonly byte[] LinePrefix = Encoding.UTF8.GetBytes("data: ");
    private static readonly byte[] LineSuffix = Encoding.UTF8.GetBytes("\r\r");
    private readonly IEventProcessor eventProcessor;
    private readonly IEventStore eventStore;
    private readonly IEventNotifier eventNotifier;
    private readonly JsonSerializerOptions jsonSerializerOptions;

    public EventsController(
        IEventProcessor eventProcessor,
        IEventStore eventStore,
        IEventNotifier eventNotifier,
        IOptions<JsonOptions> jsonOptions)
    {
        this.eventProcessor = eventProcessor;
        this.eventStore = eventStore;
        this.eventNotifier = eventNotifier;
        this.jsonSerializerOptions = jsonOptions.Value.JsonSerializerOptions;
    }

    [HttpGet("api/events")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public IActionResult GetEventsAsync([FromQuery] long afterTimestamp = 0)
    {
        return new FileCallbackResult("text/event-stream", async (body, context, ct) =>
        {
            try
            {
                var cts = new ResetCancellationTokenSource();

                // Subscribe to new events.
                // Whenever there is a new event, we cancel the wait timer to provide this event to thew
                // user as fast possible without creating too much load on the database.
                await using var subscription = await eventNotifier.SubscribeAsync(() =>
                {
                    cts.Cancel();
                });

                while (!ct.IsCancellationRequested)
                {
                    // Only deliver the events that the user has not seen yet.
                    // In practice the timestamp is not sufficient, because it does not ensure order.
                    // But for now it is good enough.
                    var @events = eventStore.GetAsync(afterTimestamp, ct);

                    await foreach (var @event in @events)
                    {
                        // Follows the syntax of event sourcing. Each row has the following format: `data: <DATA>\r\r'
                        await body.WriteAsync(LinePrefix, ct);
                        await body.WriteAsync(JsonSerializer.SerializeToUtf8Bytes(@event, jsonSerializerOptions), ct);
                        await body.WriteAsync(LineSuffix, ct);

                        // This logic could also be implemented inside the event store if there are additional options to listen to events.
                        afterTimestamp = @event.Metadata.Timestamp;
                    }

                    // A normal cancellation token can only used once, therefore we wrap the cancellation token source in a custom structure.
                    cts.Reset();
                    try
                    {
                        await Task.Delay(5000, cts.Token);
                    }
                    catch (OperationCanceledException)
                    {
                        // An event has been arrived within the wait time.
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // Usually the client lost connection.
            }
        });
    }

    [HttpPost("api/events", Name = "postEvents")]
    public async Task PostEvents(PostEventsDto request)
    {
        await eventProcessor.ApplyAsync(request.Events);
    }
}
