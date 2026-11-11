import { Component, EventEmitter, inject, Output } from '@angular/core';
import { TaskService } from '../../services/task.service';

@Component({
  imports: [],
  selector: 'app-modaltask',
  styleUrl: './modaltask.scss',
  templateUrl: './modaltask.html',
})
export class Modaltask {
  public taskService = inject(TaskService);
}
