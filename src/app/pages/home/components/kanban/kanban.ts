import { Component, inject } from '@angular/core';
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
  drop(event: CdkDragDrop<any>, newStatus: Task['status']) {
    const task = event.item.data;
    this.taskService.updateTaskStatus(task.id, newStatus);
  }

  onDragStarted() {
    document.body.classList.add('is-dragging');
  }

  onDragEnded() {
    document.body.classList.remove('is-dragging');
  }

  public taskService = inject(TaskService);
}
