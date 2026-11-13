export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'backlog' | 'todo' | 'in-progress' | 'done';
  createdAt: Date;
  position: number;
}