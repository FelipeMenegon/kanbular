namespace Kanbular.Api.Models;

public record CreateTaskRequest(string Title, string Description, string Priority);
public record MoveTaskRequest(string Status, int Position);
public record UpdateTaskRequest(string Title, string Description, string Priority);
public record ReorderColumnRequest(string Status, List<int> TaskIds);
