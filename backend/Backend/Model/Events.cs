using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Model;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "$type")]
[JsonDerivedType(typeof(TodoCreated), typeDiscriminator: nameof(TodoCreated))]
[JsonDerivedType(typeof(TodoCompleted), typeDiscriminator: nameof(TodoCompleted))]
[JsonDerivedType(typeof(TodoDeleted), typeDiscriminator: nameof(TodoDeleted))]
[JsonDerivedType(typeof(TodoUpdated), typeDiscriminator: nameof(TodoUpdated))]
[SwaggerDiscriminator("$type")]
[SwaggerSubType(typeof(TodoCreated), DiscriminatorValue = nameof(TodoCreated))]
[SwaggerSubType(typeof(TodoCompleted), DiscriminatorValue = nameof(TodoCompleted))]
[SwaggerSubType(typeof(TodoDeleted), DiscriminatorValue = nameof(TodoDeleted))]
[SwaggerSubType(typeof(TodoUpdated), DiscriminatorValue = nameof(TodoUpdated))]
public class EventBase
{
    required public EventMetadata Metadata { get; set; }
}

public sealed class EventMetadata
{
    [Required]
    required public string ObjectId { get; set; }

    [Required]
    required public string EventId { get; set; }

    [Required]
    required public string User { get; set; }

    [JsonPropertyName("ts")]
    required public long Timestamp { get; set; }
}

public sealed class TodoCreated : EventBase
{
    [Required]
    required public string Title { get; set; }
}

public sealed class TodoUpdated : EventBase
{
    [Required]
    required public string Title { get; set; }
}

public sealed class TodoCompleted : EventBase
{
}

public sealed class TodoDeleted : EventBase
{
}
