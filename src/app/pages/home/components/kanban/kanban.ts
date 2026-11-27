
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
    const task: Task = event.item.data;

    // o índice do drop é relativo ao que está na tela (ordenado por data e/ou filtrado
    // pela busca), não às posições salvas. Por isso a ordem que o usuário está vendo
    // vira a nova ordem manual da coluna, com a task inserida onde foi solta.
    // (precisa ser calculado ANTES de trocar a coluna pra 'manual')
    const visible = this.sortedTasks(newStatus).filter((t) => t.id !== task.id);
    const column = this.sortTasks(
      this.taskService.tasks().filter((t) => t.status === newStatus && t.id !== task.id),
      this.sortOrders()[newStatus],
    );

    column.splice(this.realDropIndex(visible, column, event.currentIndex), 0, task);

    this.sortOrders.update(current => ({
      ...current,
      [newStatus]: 'manual'
    }));

    this.taskService.reorderColumn(
      task.id,
      newStatus,
      column.map((t) => t.id),
    );
  }

  // com a busca ativa a coluna mostra só parte das tasks, então o índice do drop
  // precisa ser traduzido pro índice na coluna completa (na mesma ordenação)
  private realDropIndex(visible: Task[], column: Task[], visibleIndex: number) {
    const target = visible[visibleIndex];
    if (target) return column.findIndex((t) => t.id === target.id);

    const last = visible.at(-1);
    return last ? column.findIndex((t) => t.id === last.id) + 1 : column.length;
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

  // o click dispara depois de soltar a task (no touch, às vezes numa task separada,
  // depois de um setTimeout). Por isso a flag só é zerada no próximo toque/clique,
  // e não por tempo: qualquer click que vier depois de um drag é ignorado.
  private dragged = false;

  onTaskPointerDown() {
    this.dragged = false;
  }

  onTaskDragStarted() {
    this.dragged = true;
    this.onDragStarted();
  }

  openTask(task: Task) {
    if (this.dragged) return;
    this.taskService.openEditModal(task);
  }
}
