namespace Backend.Model;

public sealed class TodoRepository(ITodoStore todoStore) : ITodoRepository
{
    public async Task<SyncResult> ApplyEventAsync(EventBase @event)
    {
        switch (@event)
        {
            case TodoCreated todoCreated:
                {
                    await todoStore.InsertAsync(
                        new Todo
                        {
                            Id = @event.Metadata.ObjectId,
                            IsCompleted = false,
                            IsDeleted = false,
                            Title = todoCreated.Title,
                        });

                    return SyncResult.Done;
                }

            case TodoUpdated todoUpdated:
                {
                    var todo = await todoStore.GetTodoAsync(@event.Metadata.ObjectId);

                    if (todo == null)
                    {
                        return SyncResult.NotFound;
                    }

                    if (todo.IsDeleted)
                    {
                        return SyncResult.ConflictIgnored;
                    }

                    if (todo.Title == todoUpdated.Title)
                    {
                        return SyncResult.Ignored;
                    }

                    if (todo.Title.CanUpdate(todoUpdated.Metadata.Timestamp))
                    {
                        return SyncResult.Conflict;
                    }

                    todo.Title = new SyncField<string>(todoUpdated.Title, @event.Metadata.Timestamp);
                    await todoStore.UpdateAsync(todo);

                    return SyncResult.Done;
                }

            case TodoCompleted:
                {
                    var todo = await todoStore.GetTodoAsync(@event.Metadata.ObjectId);

                    if (todo == null)
                    {
                        return SyncResult.NotFound;
                    }

                    if (todo.IsDeleted || todo.IsCompleted)
                    {
                        return SyncResult.ConflictIgnored;
                    }

                    todo.IsCompleted = new SyncField<bool>(true, @event.Metadata.Timestamp);
                    await todoStore.UpdateAsync(todo);

                    return SyncResult.Done;
                }

            case TodoDeleted:
                {
                    var todo = await todoStore.GetTodoAsync(@event.Metadata.ObjectId);

                    if (todo == null)
                    {
                        return SyncResult.NotFound;
                    }

                    if (todo.IsDeleted)
                    {
                        return SyncResult.Ignored;
                    }

                    todo.IsDeleted = true;
                    await todoStore.UpdateAsync(todo);

                    return SyncResult.Done;
                }

        }

        return SyncResult.Ignored;
    }
}
