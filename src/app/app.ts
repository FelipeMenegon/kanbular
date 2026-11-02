import { Component, signal } from '@angular/core';
import { Header } from './header/header';
import { MenuBar } from './menu-bar/menu-bar';
import { Kanban } from './kanban/kanban';

@Component({
  imports: [Header, MenuBar, Kanban],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('kanbular');
}
