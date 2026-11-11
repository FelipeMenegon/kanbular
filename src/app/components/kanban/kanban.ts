import { Component, inject } from '@angular/core';
import { Task } from '../../models/task';
import { TaskComponent } from '../task/task';
import { TaskService } from '../../services/task.service';

@Component({
  imports: [TaskComponent],
  selector: 'app-kanban',
  styleUrl: './kanban.scss',
  templateUrl: './kanban.html',
})
export class Kanban {

  public taskService = inject(TaskService);
}