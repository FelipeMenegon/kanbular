using Kanbular.Api.Data;
using Kanbular.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Kanbular.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/tasks
    [HttpGet]
    public async Task<List<TaskItem>> GetAll()
    {
        return await _db.Tasks.OrderBy(t => t.Position).ToListAsync();
    }

    // POST /api/tasks
    [HttpPost]
    public async Task<TaskItem> Create(CreateTaskRequest request)
    {
        var position = await _db.Tasks.CountAsync(t => t.Status == "backlog");

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            Status = "backlog",
            Position = position,
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        return task;
    }

    // PUT /api/tasks/5
    [HttpPut("{id}")]
    public async Task<ActionResult<TaskItem>> Update(int id, UpdateTaskRequest request)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task is null) return NotFound();

        task.Title = request.Title;
        task.Description = request.Description;
        task.Priority = request.Priority;

        await _db.SaveChangesAsync();

        return task;
    }

    // PUT /api/tasks/5/move
    [HttpPut("{id}/move")]
    public async Task<IActionResult> Move(int id, MoveTaskRequest request)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task is null) return NotFound();

        var oldStatus = task.Status;

        var column = await _db.Tasks
            .Where(t => t.Status == request.Status && t.Id != id)
            .OrderBy(t => t.Position)
            .ToListAsync();

        var position = Math.Clamp(request.Position, 0, column.Count);
        task.Status = request.Status;
        column.Insert(position, task);

        for (var i = 0; i < column.Count; i++)
            column[i].Position = i;

        if (oldStatus != request.Status)
        {
            var oldColumn = await _db.Tasks
                .Where(t => t.Status == oldStatus && t.Id != id)
                .OrderBy(t => t.Position)
                .ToListAsync();

            for (var i = 0; i < oldColumn.Count; i++)
                oldColumn[i].Position = i;
        }

        await _db.SaveChangesAsync();

        return NoContent();
    }
}