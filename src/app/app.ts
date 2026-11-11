import { Component, signal } from '@angular/core';
import { Header } from './core/components/header/header';
import { MenuBar } from './core/components/menu-bar/menu-bar';
import { Kanban } from './pages/home/components/kanban/kanban';

@Component({
  imports: [Header, MenuBar, Kanban],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('kanbular');
}
