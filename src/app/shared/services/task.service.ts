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

    // 1. Cria cópias das tarefas
    const updatedTasks = tasks.map(task => ({ ...task }));

    // 2. Encontra a tarefa que será movida
    const taskIndex = updatedTasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) return tasks;

    // 3. Remove a tarefa da lista
    const [movedTask] = updatedTasks.splice(taskIndex, 1);

    // 4. Atualiza o status da tarefa
    movedTask.status = newStatus;

    // 5. Separa as tarefas da nova coluna
    const tasksInColumn = updatedTasks
      .filter(task => task.status === newStatus)
      .sort((a, b) => a.position - b.position);

    // 6. Insere a tarefa na nova posição
    tasksInColumn.splice(newPosition, 0, movedTask);

    // 7. Atualiza as posições
    this.updatePositions(tasksInColumn);

    // 8. Separa as tarefas das outras colunas
    const otherTasks = updatedTasks.filter(
      task => task.status !== newStatus
    );

    // 9. Junta todas as tarefas novamente
    return [...otherTasks, ...tasksInColumn];
  });
}

// Atualiza a posição de cada tarefa
private updatePositions(tasks: Task[]) {
  tasks.forEach((task, index) => {
    task.position = index;
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
