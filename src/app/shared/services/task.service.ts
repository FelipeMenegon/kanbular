import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5057/api/tasks';

  tasks = signal<Task[]>([]);

  openedModal = signal(false);

  constructor() {
    this.loadTasks();
  }

  // GET /api/tasks
  loadTasks() {
    this.http.get<Task[]>(this.apiUrl).subscribe((tasks) => {
      this.tasks.set(
        tasks.map((task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        })),
      );
    });
  }

  openModal() {
    this.openedModal.set(true);
  }

  closeModals() {
    this.openedModal.set(false);
  }

  updateTaskPosition(taskId: number, newStatus: Task['status'], newPosition: number) {
    // Atualiza a tela na hora (a mesma lógica de antes)...
    this.tasks.update((tasks) => {
      const updatedTasks = tasks.map((task) => ({ ...task }));

      const taskIndex = updatedTasks.findIndex((task) => task.id === taskId);

      if (taskIndex === -1) return tasks;

      const [movedTask] = updatedTasks.splice(taskIndex, 1);

      movedTask.status = newStatus;

      const tasksInColumn = updatedTasks
        .filter((task) => task.status === newStatus)
        .sort((a, b) => a.position - b.position);

      tasksInColumn.splice(newPosition, 0, movedTask);

      this.updatePositions(tasksInColumn);

      const otherTasks = updatedTasks.filter((task) => task.status !== newStatus);

      return [...otherTasks, ...tasksInColumn];
    });

    // ...e avisa o servidor. Se der erro, recarrega do banco para desfazer.
    this.http
      .put(`${this.apiUrl}/${taskId}/move`, { status: newStatus, position: newPosition })
      .subscribe({ error: () => this.loadTasks() });
  }

  private updatePositions(tasks: Task[]) {
    tasks.forEach((task, index) => {
      task.position = index;
    });
  }

  // POST /api/tasks
  createTask(title: string, description: string, priority: 'low' | 'medium' | 'high') {
    this.http.post<Task>(this.apiUrl, { title, description, priority }).subscribe((task) => {
      this.tasks.update((tasks) => [...tasks, { ...task, createdAt: new Date(task.createdAt) }]);
    });
  }
}