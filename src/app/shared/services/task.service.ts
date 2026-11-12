import { Injectable, effect, signal } from '@angular/core';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  tasks = signal<Task[]>(this.loadTasks());

  openedModal = signal(false);

  constructor() {
    effect(() => {
      localStorage.setItem('tasks', JSON.stringify(this.tasks()));
    });
  }

  loadTasks(): Task[] {
    const savedTasks = localStorage.getItem('tasks');

    if (!savedTasks) {
      return [];
    }

    try {
      const tasks: Task[] = JSON.parse(savedTasks);

      return tasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt)
      }));
    } catch {
      return [];
    }
  }

  abrirModal() {
    this.openedModal.set(true);
  }

  fecharModal() {
    this.openedModal.set(false);
  }

  createTask(
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high'
  ) {
    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      priority,
      status: 'backlog',
      createdAt: new Date(),
    };

    this.tasks.update(tasks => [...tasks, newTask]);
  }
}