import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../../shared/services/task.service';
import { Task } from '../../../../shared/models/task';

@Component({
  selector: 'app-modaltask',
  imports: [FormsModule],
  templateUrl: './modaltask.html',
  styleUrl: './modaltask.scss'
})
export class Modaltask implements AfterViewInit {

  @ViewChild('titleInput') titleInput?: ElementRef<HTMLInputElement>;

  title: string = '';
  description: string = '';
  priority: Task['priority'] = 'medium';

  readonly priorities: { value: Task['priority']; label: string }[] = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
  ];

  constructor(public taskService: TaskService) {}

  ngAfterViewInit() {
    setTimeout(() => this.titleInput?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  close() {
    this.taskService.closeModals();
  }

  submit() {
    const title = this.title.trim();
    if (!title) return;

    this.taskService.createTask(title, this.description.trim(), this.priority);
    this.close();
  }
}
