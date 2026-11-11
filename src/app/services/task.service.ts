import { EventEmitter, Output, Service, signal } from '@angular/core';
import { Task } from '../models/task';

@Service()
export class TaskService {
  tasks = signal<Task[]>([]);

  modalAberto = signal(false);

  abrirModal() {
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
  }

  createTask() {
    const newTask: Task = {
      id: this.tasks().length + 1,
      title: 'New Task',
      description: 'This is a new task',
      priority: 'medium',
      status: 'backlog',
      createdAt: new Date(),
    };

    this.tasks.update((tasks) => [...tasks, newTask]);
  }
}
