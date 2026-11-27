import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  leaving: boolean;
}

const DURATION = 3500;
const LEAVE_ANIMATION = 200;

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  private nextId = 0;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  success(message: string) {
    this.show('success', message);
  }

  error(message: string) {
    this.show('error', message);
  }

  dismiss(id: number) {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);

    // marca como saindo pra animação rodar, depois remove
    this.toasts.update((toasts) => toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
    }, LEAVE_ANIMATION);
  }

  private show(type: ToastType, message: string) {
    const id = this.nextId++;
    this.toasts.update((toasts) => [...toasts, { id, type, message, leaving: false }]);
    this.timers.set(id, setTimeout(() => this.dismiss(id), DURATION));
  }
}
