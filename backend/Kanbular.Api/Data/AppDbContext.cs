using Kanbular.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Kanbular.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<TaskItem> Tasks => Set<TaskItem>();
}