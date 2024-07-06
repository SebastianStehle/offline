using Backend.Controllers.Models;
using Backend.Model;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
public sealed class TodosController : ControllerBase
{
    private readonly ITodoStore todoStore;

    public TodosController(ITodoStore todoStore)
    {
        this.todoStore = todoStore;
    }

    [HttpGet("api/todos", Name = "getTodos")]
    [ProducesResponseType<TodosDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTodosAsync()
    {
        var todos = await todoStore.GetTodosAsync();

        var response = new TodosDto
        {
            Todos = todos.Select(todo =>
            {
                return new TodoDto
                {
                    Id = todo.Id,
                    IsCompleted = new BooleanModelValueDto
                    {
                        Value = todo.IsCompleted.Value,
                        Ts = todo.IsCompleted.Ts
                    },
                    IsDeleted = new BooleanModelValueDto
                    {
                        Value = todo.IsDeleted.Value,
                        Ts = todo.IsDeleted.Ts
                    },
                    Title = new StringModelValueDto
                    {
                        Value = todo.Title.Value,
                        Ts = todo.Title.Ts
                    },
                };
            }).ToList()
        };

        return Ok(response);
    }
}
