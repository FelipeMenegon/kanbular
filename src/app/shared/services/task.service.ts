import { EventEmitter, Output, Service, signal } from '@angular/core';
import { Task } from '../models/task';

@Service()
export class TaskService {
  tasks = signal<Task[]>([]);

  openedModal = signal(false);

  abrirModal() {
    this.openedModal.set(true);
  }

  fecharModal() {
    this.openedModal.set(false);
  }

  createTask(title: string, description: string, priority: 'low' | 'medium' | 'high') {
    const newTask: Task = {
      id: this.tasks().length + 1,
      title: title,
      description: description,
      priority: priority,
      status: 'backlog',
      createdAt: new Date(),
    };

    this.tasks.update((tasks) => [...tasks, newTask]);
  }
}
