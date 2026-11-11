import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../../shared/services/task.service';

@Component({
  selector: 'app-modaltask',
  imports: [FormsModule],
  templateUrl: './modaltask.html',
  styleUrl: './modaltask.scss'
})
export class Modaltask {

  title: string = '';
  description: string = '';
  priority: 'low' | 'medium' | 'high' = 'medium';
  constructor(public taskService: TaskService) {}

}