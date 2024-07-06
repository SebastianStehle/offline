using Backend.Model;
using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers.Models;

public class PostEventsDto
{
    [Required]
    required public List<EventBase> Events { get; set; }
}
