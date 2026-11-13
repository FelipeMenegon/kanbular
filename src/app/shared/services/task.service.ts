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

  updateTaskPosition(
    taskId: number,
    newStatus: Task['status'],
    newPosition: number
  ) {
    this.tasks.update(tasks => {
      const updatedTasks = tasks.map(task => ({ ...task }));

      const taskIndex = updatedTasks.findIndex(
        task => task.id === taskId
      );

      if (taskIndex === -1) return tasks;

      const [movedTask] = updatedTasks.splice(taskIndex, 1);

      movedTask.status = newStatus;

      const tasksInColumn = updatedTasks
        .filter(task => task.status === newStatus)
        .sort((a, b) => a.position - b.position);

      tasksInColumn.splice(newPosition, 0, movedTask);

      tasksInColumn.forEach((task, index) => {
        task.position = index;
      });

      const otherTasks = updatedTasks.filter(
        task => task.status !== newStatus
      );

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
      position: this.tasks().filter(task => task.status === 'backlog').length,
    };

    this.tasks.update((tasks) => [...tasks, newTask]);
  }
}
