
import { Component, inject, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskComponent } from '../task/task';
import { TaskService } from '../../../../shared/services/task.service';
import { Modaltask } from '../modaltask/modaltask';
import { Taskdetail } from '../taskdetail/taskdetail';
import { Task } from '../../../../shared/models/task';

@Component({
  imports: [TaskComponent, Modaltask, Taskdetail, DragDropModule],
  selector: 'app-kanban',
  styleUrl: './kanban.scss',
  templateUrl: './kanban.html',
})
export class Kanban {

  public taskService = inject(TaskService);

  showSortMenu = signal<string | null>(null);

  sortOrders = signal<Record<Task['status'], 'newest' | 'oldest' | 'manual'>>({
    backlog: 'newest',
    todo: 'newest',
    'in-progress': 'newest',
    done: 'newest'
  });

  sortedTasks(status: Task['status']) {
    return this.sortTasks(
      this.taskService.filteredTasks().filter((task) => task.status === status),
      this.sortOrders()[status],
    );
  }

  private sortTasks(tasks: Task[], order: 'newest' | 'oldest' | 'manual') {
    return [...tasks].sort((a, b) => {
      if (order === 'manual') {
        return a.position - b.position;
      }

      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return order === 'newest'
        ? dateB - dateA
        : dateA - dateB;
    });
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: Task['status']) {
    const task = event.item.data;

    this.sortOrders.update(current => ({
      ...current,
      [newStatus]: 'manual'
    }));

    this.taskService.updateTaskPosition(
      task.id,
      newStatus,
      this.realDropIndex(task, newStatus, event.currentIndex)
    );
  }

  // com a busca ativa a coluna mostra só parte das tasks, então o índice do drop
  // precisa ser traduzido pra posição real na coluna completa
  private realDropIndex(task: Task, status: Task['status'], visibleIndex: number) {
    if (!this.taskService.isSearching()) return visibleIndex;

    const visible = this.sortedTasks(status).filter((t) => t.id !== task.id);
    const all = this.sortTasks(
      this.taskService.tasks().filter((t) => t.status === status && t.id !== task.id),
      'manual',
    );

    const target = visible[visibleIndex];
    if (target) return all.findIndex((t) => t.id === target.id);

    const last = visible.at(-1);
    return last ? all.findIndex((t) => t.id === last.id) + 1 : all.length;
  }

  toggleSortMenu(column: string) {
    this.showSortMenu.update(current =>
      current === column ? null : column
    );
  }

  setSortOrder(order: 'newest' | 'oldest', status: Task['status']) {
    this.sortOrders.update(current => ({
      ...current,
      [status]: order
    }));

    this.showSortMenu.set(null);
  }

  ngOnInit() {
    document.addEventListener('mouseup', this.onDragEnded);
  }

  onDragStarted() {
    document.body.classList.add('is-dragging');
  }

  onDragEnded() {
    document.body.classList.remove('is-dragging');
  }

  // o click dispara logo depois de soltar a task; isso evita abrir o modal ao arrastar
  private justDragged = false;

  onTaskDragEnded() {
    this.onDragEnded();
    this.justDragged = true;
    setTimeout(() => (this.justDragged = false));
  }

  openTask(task: Task) {
    if (this.justDragged) return;
    this.taskService.openEditModal(task);
  }
}
