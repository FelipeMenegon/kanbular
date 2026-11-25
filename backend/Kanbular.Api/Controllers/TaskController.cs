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

    // PUT /api/tasks/5/move
    [HttpPut("{id}/move")]
    public async Task<IActionResult> Move(int id, MoveTaskRequest request)
    {
        // 1. Busca a tarefa no banco
        var task = await _db.Tasks.FindAsync(id);
        if (task is null) return NotFound();

        var oldStatus = task.Status;

        // 2. Pega as outras tarefas da coluna de destino, em ordem
        var column = await _db.Tasks
            .Where(t => t.Status == request.Status && t.Id != id)
            .OrderBy(t => t.Position)
            .ToListAsync();

        // 3. Coloca a tarefa na nova posição
        var position = Math.Clamp(request.Position, 0, column.Count);
        task.Status = request.Status;
        column.Insert(position, task);

        // 4. Renumera a coluna de destino: 0, 1, 2...
        for (var i = 0; i < column.Count; i++)
            column[i].Position = i;

        // 5. Se mudou de coluna, renumera a coluna antiga para não ficar "buraco"
        if (oldStatus != request.Status)
        {
            var oldColumn = await _db.Tasks
                .Where(t => t.Status == oldStatus && t.Id != id)
                .OrderBy(t => t.Position)
                .ToListAsync();

            for (var i = 0; i < oldColumn.Count; i++)
                oldColumn[i].Position = i;
        }

        // 6. Salva tudo no banco de uma vez
        await _db.SaveChangesAsync();

        return NoContent();
    }
}