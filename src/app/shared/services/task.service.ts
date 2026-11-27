import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { Task } from '../models/task';
import { ToastService } from './toast.service';
import { matchesTask } from '../utils/search';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private apiUrl = 'http://localhost:5057/api/tasks';

  tasks = signal<Task[]>([]);

  // termo digitado no search do header; filtra o quadro inteiro
  searchQuery = signal('');

  isSearching = computed(() => this.searchQuery().trim().length > 0);

  filteredTasks = computed(() => {
    const query = this.searchQuery();
    return this.tasks().filter((task) => matchesTask(task, query));
  });

  clearSearch() {
    this.searchQuery.set('');
  }

  openedModal = signal(false);

  // task aberta no modal de detalhes (null = fechado)
  editingTask = signal<Task | null>(null);

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
    this.editingTask.set(null);
    this.openedModal.set(true);
  }

  openEditModal(task: Task) {
    this.openedModal.set(false);
    this.editingTask.set(task);
  }

  closeModals() {
    this.openedModal.set(false);
    this.editingTask.set(null);
  }

  // salva a ordem completa de uma coluna depois de um drag (taskIds já na ordem final,
  // incluindo a task movida). Atualiza a tela na hora; se der erro, recarrega do banco.
  reorderColumn(movedTaskId: number, status: Task['status'], taskIds: number[]) {
    this.tasks.update((tasks) => {
      const oldStatus = tasks.find((t) => t.id === movedTaskId)?.status;

      const updated = tasks.map((task) => {
        const index = taskIds.indexOf(task.id);
        return index === -1 ? { ...task } : { ...task, status, position: index };
      });

      // fecha o buraco na coluna de onde a task saiu
      if (oldStatus && oldStatus !== status) {
        this.updatePositions(
          updated.filter((t) => t.status === oldStatus).sort((a, b) => a.position - b.position),
        );
      }

      return updated;
    });

    // PUT /api/tasks/reorder
    this.http
      .put(`${this.apiUrl}/reorder`, { status, taskIds })
      .subscribe({ error: () => this.loadTasks() });
  }

  // atualiza a lista na tela na hora e devolve a requisição pro servidor
  private moveLocally(taskId: number, newStatus: Task['status'], newPosition: number) {
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

    return this.http.put(`${this.apiUrl}/${taskId}/move`, { status: newStatus, position: newPosition });
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

  // salva o que mudou no modal de detalhes (campos e/ou coluna) e avisa com um toast só
  saveTask(
    task: Task,
    changes: Pick<Task, 'title' | 'description' | 'priority' | 'status'>,
  ) {
    const requests: Observable<unknown>[] = [];
    const { title, description, priority, status } = changes;

    if (title !== task.title || description !== task.description || priority !== task.priority) {
      this.tasks.update((tasks) =>
        tasks.map((t) => (t.id === task.id ? { ...t, title, description, priority } : t)),
      );

      // PUT /api/tasks/{id}
      requests.push(this.http.put(`${this.apiUrl}/${task.id}`, { title, description, priority }));
    }

    if (status !== task.status) {
      // mudou de coluna: vai pro fim da nova coluna
      const position = this.tasks().filter((t) => t.status === status).length;
      requests.push(this.moveLocally(task.id, status, position));
    }

    if (!requests.length) return;

    forkJoin(requests).subscribe({
      next: () => this.toast.success('Tarefa salva com sucesso'),
      error: () => {
        this.toast.error('Não foi possível salvar a tarefa');
        this.loadTasks();
      },
    });
  }
}
