import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  constructor(private taskService: TaskService) {}
}
