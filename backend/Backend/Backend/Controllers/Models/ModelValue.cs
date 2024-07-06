using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers.Models;

public sealed class StringModelValueDto
{
    [Required]
    required public string Value { get; set; }

    required public long Ts { get; set; }
}

public sealed class BooleanModelValueDto
{
    required public bool Value { get; set; }

    required public long Ts { get; set; }
}
