import { Component, inject } from '@angular/core';
import { Task } from '../../../../shared/models/task';
import { TaskComponent } from '../task/task';
import { TaskService } from '../../../../shared/services/task.service';
import { Modaltask } from '../modaltask/modaltask';

@Component({
  imports: [TaskComponent, Modaltask],
  selector: 'app-kanban',
  styleUrl: './kanban.scss',
  templateUrl: './kanban.html',
})
export class Kanban {

  public taskService = inject(TaskService);
}