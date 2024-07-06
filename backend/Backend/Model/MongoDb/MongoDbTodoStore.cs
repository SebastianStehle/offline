using MongoDB.Bson;
using MongoDB.Driver;

namespace Backend.Model.MongoDb;

public sealed class MongoDbTodoStore(IMongoDatabase database) : ITodoStore
{
    private readonly IMongoCollection<Todo> collection = database.GetCollection<Todo>("todos");

    public async Task<List<Todo>> GetTodosAsync()
    {
        var result = await collection.Find(new BsonDocument()).ToListAsync();

        return result.Where(x => !x.IsDeleted).ToList();
    }

    public async Task<Todo?> GetTodoAsync(string id)
    {
        var result = await collection.Find(x => x.Id == id).FirstOrDefaultAsync();

        return result;
    }

    public Task InsertAsync(Todo todo)
    {
        return collection.InsertOneAsync(todo);
    }

    public Task UpdateAsync(Todo todo)
    {
        return collection.ReplaceOneAsync(x => x.Id == todo.Id, todo);
    }

    public Task DeleteAsync(Todo todo)
    {
        return collection.DeleteOneAsync(x => x.Id == todo.Id);
    }
}
