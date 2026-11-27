import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { TaskService } from '../../../shared/services/task.service';
import { Task } from '../../../shared/models/task';
import { highlight } from '../../../shared/utils/search';

const MAX_RESULTS = 6;

@Component({
  selector: 'app-search',
  styleUrl: './search.scss',
  templateUrl: './search.html',
  host: {
    '(document:keydown)': 'onGlobalKeydown($event)',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
  },
})
export class Search {
  private taskService = inject(TaskService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  readonly query = this.taskService.searchQuery;

  // dropdown de resultados aberto
  readonly open = signal(false);

  // no mobile o campo fica recolhido num botão e expande por cima do header
  readonly expanded = signal(false);

  readonly activeIndex = signal(-1);

  readonly isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

  readonly statusLabels: Record<Task['status'], string> = {
    backlog: 'Backlog',
    todo: 'A Fazer',
    'in-progress': 'Em Andamento',
    done: 'Concluído',
  };

  readonly total = computed(() => this.taskService.filteredTasks().length);

  readonly results = computed(() => {
    const query = this.query();
    return this.taskService
      .filteredTasks()
      .slice(0, MAX_RESULTS)
      .map((task) => ({
        task,
        title: highlight(task.title, query),
        description: highlight(task.description ?? '', query, 70),
      }));
  });

  readonly showDropdown = computed(() => this.open() && this.taskService.isSearching());

  onInput(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(-1);
    this.open.set(true);
  }

  onKeydown(event: KeyboardEvent) {
    const count = this.results().length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open.set(true);
        if (count) this.activeIndex.update((i) => (i + 1) % count);
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (count) this.activeIndex.update((i) => (i <= 0 ? count - 1 : i - 1));
        break;

      case 'Enter': {
        event.preventDefault();
        const active = this.results()[this.activeIndex()];
        if (active) {
          this.select(active.task);
        } else {
          // Enter sem item selecionado: mantém o filtro no quadro e fecha a lista
          this.open.set(false);
        }
        break;
      }

      case 'Escape':
        event.preventDefault();
        if (this.open() && this.query()) {
          this.open.set(false);
        } else if (this.query()) {
          this.clear();
        } else {
          this.collapse();
        }
        break;
    }
  }

  // Ctrl/Cmd + K ou "/" focam a busca de qualquer lugar da página
  onGlobalKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    const typing =
      !!target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

    const isShortcut =
      ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') ||
      (event.key === '/' && !typing);

    if (isShortcut) {
      event.preventDefault();
      this.focus();
    }
  }

  onDocumentPointerDown(event: PointerEvent) {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
      if (!this.query()) this.expanded.set(false);
    }
  }

  focus() {
    this.expanded.set(true);
    // espera o campo aparecer (mobile) antes de focar
    setTimeout(() => {
      this.input().nativeElement.focus();
      this.input().nativeElement.select();
    });
  }

  collapse() {
    this.open.set(false);
    this.expanded.set(false);
    this.input().nativeElement.blur();
  }

  clear() {
    this.taskService.clearSearch();
    this.activeIndex.set(-1);
    this.input().nativeElement.focus();
  }

  select(task: Task) {
    this.open.set(false);
    this.activeIndex.set(-1);
    this.input().nativeElement.blur();
    this.taskService.openEditModal(task);
  }
}
