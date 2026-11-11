import { Component, inject } from '@angular/core';
import { TaskService } from '../../../shared/services/task.service';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  public taskService = inject(TaskService);
}
