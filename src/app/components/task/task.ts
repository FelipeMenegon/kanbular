import { Component, Input } from '@angular/core';
import { Task } from '../../models/task';

@Component({
  imports: [],
  selector: 'app-task',
  styleUrl: './task.scss',
  templateUrl: './task.html',
})
export class TaskComponent {

  @Input() task!: Task;

}
