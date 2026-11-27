import { Task } from '../models/task';
import { highlight, matchesTask, normalize } from './search';

const task = (title: string, description = ''): Task => ({
  id: 1,
  title,
  description,
  priority: 'low',
  status: 'todo',
  createdAt: new Date(),
  position: 0,
});

describe('search utils', () => {
  it('normaliza acentos e caixa', () => {
    expect(normalize('Ação RÁPIDA')).toBe('acao rapida');
  });

  it('encontra pelo título ou descrição ignorando acentos', () => {
    expect(matchesTask(task('Revisão do layout'), 'revisao')).toBe(true);
    expect(matchesTask(task('Deploy', 'Configurar produção'), 'PRODUCAO')).toBe(true);
    expect(matchesTask(task('Deploy'), 'banco')).toBe(false);
    expect(matchesTask(task('Deploy'), '   ')).toBe(true);
  });

  it('marca os trechos encontrados preservando o texto original', () => {
    expect(highlight('Ação e reação', 'acao')).toEqual([
      { text: 'Ação', match: true },
      { text: ' e re', match: false },
      { text: 'ação', match: true },
    ]);
  });

  it('recorta textos longos ao redor da ocorrência', () => {
    const text = 'a'.repeat(100) + 'alvo' + 'b'.repeat(100);
    const segments = highlight(text, 'alvo', 40);

    expect(segments[0].text).toBe('…');
    expect(segments.at(-1)!.text).toBe('…');
    expect(segments.some((s) => s.match && s.text === 'alvo')).toBe(true);
  });
});
