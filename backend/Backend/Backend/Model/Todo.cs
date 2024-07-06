namespace Backend.Model;

public sealed class Todo
{
    required public string Id { get; set; }

    required public SyncField<string> Title { get; set; }

    required public SyncField<bool> IsCompleted { get; set; }

    required public SyncField<bool> IsDeleted { get; set; }
}
