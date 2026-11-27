import { Component, inject } from '@angular/core';
import { TaskService } from '../../../shared/services/task.service';
import { Search } from '../search/search';

@Component({
  imports: [Search],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {
  public taskService = inject(TaskService);
}
