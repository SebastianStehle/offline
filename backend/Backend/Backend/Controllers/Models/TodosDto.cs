using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers.Models;

public class TodosDto
{
    [Required]
    required public List<TodoDto> Todos { get; set; }
}
