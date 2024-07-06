using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers.Models;

public sealed class TodoDto
{
    [Required]
    required public string Id { get; set; }

    [Required]
    required public StringModelValueDto Title { get; set; }

    [Required]
    required public BooleanModelValueDto IsCompleted { get; set; }

    [Required]
    required public BooleanModelValueDto IsDeleted { get; set; }
}
