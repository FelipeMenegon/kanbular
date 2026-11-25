namespace Kanbular.Api.Models;

public record CreateTaskRequest(string Title, string Description, string Priority);
public record MoveTaskRequest(string Status, int Position);
