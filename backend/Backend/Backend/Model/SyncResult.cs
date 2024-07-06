namespace Backend.Model;

public enum SyncResult
{
    Done,
    Ignored,
    NotFound,
    Conflict,
    ConflictIgnored
}
