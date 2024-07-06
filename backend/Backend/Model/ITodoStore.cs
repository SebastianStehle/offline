namespace Backend.Model;

public interface ITodoStore
{
    Task<List<Todo>> GetTodosAsync();

    Task<Todo?> GetTodoAsync(string id);

    Task InsertAsync(Todo todo);

    Task UpdateAsync(Todo todo);

    Task DeleteAsync(Todo todo);
}
