import { Injectable, effect, signal } from '@angular/core';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root',
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

      return tasks.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
      }));
    } catch {
      return [];
    }
  }

  openModal() {
    this.openedModal.set(true);
  }

  closeModals() {
    this.openedModal.set(false);
  }

  updateTaskPosition(taskId: number, newStatus: Task['status'], newPosition: number) {
    this.tasks.update((tasks) => {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);

      const task = tasks.find((task) => task.id === taskId);

      if (!task) return tasks;

      task.status = newStatus;

      const tasksInColumn = updatedTasks.filter((task) => task.status === newStatus);

      tasksInColumn.splice(newPosition, 0, task);

      const otherTasks = updatedTasks.filter((task) => task.status !== newStatus);

      return [...otherTasks, ...tasksInColumn];
    });
  }

  createTask(title: string, description: string, priority: 'low' | 'medium' | 'high') {
    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      priority,
      status: 'backlog',
      createdAt: new Date(),
    };

    this.tasks.update((tasks) => [...tasks, newTask]);
  }
}
