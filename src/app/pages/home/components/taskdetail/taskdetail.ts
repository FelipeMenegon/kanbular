import { Component, HostListener, OnInit, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../../shared/services/task.service';
import { Task } from '../../../../shared/models/task';

@Component({
  selector: 'app-taskdetail',
  imports: [FormsModule],
  templateUrl: './taskdetail.html',
  styleUrl: './taskdetail.scss',
})
export class Taskdetail implements OnInit {
  private taskService = inject(TaskService);

  task = input.required<Task>();

  title = '';
  description = '';
  priority: Task['priority'] = 'medium';
  status: Task['status'] = 'backlog';

  readonly statuses: { value: Task['status']; label: string; icon: string }[] = [
    { value: 'backlog', label: 'Backlog', icon: '📥' },
    { value: 'todo', label: 'A Fazer', icon: '📋' },
    { value: 'in-progress', label: 'Em Andamento', icon: '🚀' },
    { value: 'done', label: 'Concluído', icon: '✅' },
  ];

  readonly priorities: { value: Task['priority']; label: string }[] = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
  ];

  ngOnInit() {
    this.reset();
  }

  get currentStatus() {
    return this.statuses.find((s) => s.value === this.task().status)!;
  }

  get createdAtLabel() {
    return new Date(this.task().createdAt).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get createdAgo() {
    const days = Math.floor((Date.now() - new Date(this.task().createdAt).getTime()) / 86_400_000);
    if (days <= 0) return 'hoje';
    if (days === 1) return 'ontem';
    return `há ${days} dias`;
  }

  get isDirty() {
    const task = this.task();
    return (
      this.title.trim() !== task.title ||
      this.description.trim() !== task.description ||
      this.priority !== task.priority ||
      this.status !== task.status
    );
  }

  get canSave() {
    return this.isDirty && this.title.trim().length > 0;
  }

  reset() {
    const task = this.task();
    this.title = task.title;
    this.description = task.description;
    this.priority = task.priority;
    this.status = task.status;
  }

  @HostListener('document:keydown.escape')
  close() {
    this.taskService.closeModals();
  }

  @HostListener('document:keydown.control.enter')
  @HostListener('document:keydown.meta.enter')
  save() {
    if (!this.canSave) return;

    const task = this.task();
    const title = this.title.trim();
    const description = this.description.trim();

    if (title !== task.title || description !== task.description || this.priority !== task.priority) {
      this.taskService.updateTask(task.id, title, description, this.priority);
    }

    // mudou de coluna: vai pro fim da nova coluna
    if (this.status !== task.status) {
      const position = this.taskService.tasks().filter((t) => t.status === this.status).length;
      this.taskService.updateTaskPosition(task.id, this.status, position);
    }

    this.close();
  }

  // Enter no título não quebra linha, só sai do campo
  blurOnEnter(event: Event) {
    event.preventDefault();
    (event.target as HTMLElement).blur();
  }
}
