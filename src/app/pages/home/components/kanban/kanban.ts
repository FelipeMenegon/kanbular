
import { Component, inject, signal } from '@angular/core';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { TaskComponent } from '../task/task';
import { TaskService } from '../../../../shared/services/task.service';
import { Modaltask } from '../modaltask/modaltask';
import { Task } from '../../../../shared/models/task';

@Component({
  imports: [TaskComponent, Modaltask, DragDropModule],
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
    const tasks = this.taskService.tasks()
      .filter(task => task.status === status);

    const order = this.sortOrders()[status];

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
      event.currentIndex
    );
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
}
