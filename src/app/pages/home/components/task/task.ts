import { Component, Input } from '@angular/core';
import { Task } from '../../../../shared/models/task';
import { DatePipe } from '@angular/common';

@Component({
  imports: [DatePipe],
  selector: 'app-task',
  styleUrl: './task.scss',
  templateUrl: './task.html',
})
export class TaskComponent {

  @Input() task!: Task;

  priorityLabels: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta'
  };
}

