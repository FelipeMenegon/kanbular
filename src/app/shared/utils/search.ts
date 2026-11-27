import { Task } from '../models/task';

export interface TextSegment {
  text: string;
  match: boolean;
}

// remove acentos e deixa minúsculo: "Ação" -> "acao"
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function matchesTask(task: Task, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;

  return normalize(task.title).includes(q) || normalize(task.description ?? '').includes(q);
}

/**
 * Quebra o texto em pedaços marcando onde o termo aparece (ignorando acentos),
 * pra destacar no template sem usar innerHTML.
 * Com `maxLength`, devolve só um trecho ao redor da primeira ocorrência.
 */
export function highlight(text: string, query: string, maxLength?: number): TextSegment[] {
  const source = text ?? '';
  const q = normalize(query.trim());

  // normaliza caractere a caractere pra manter o mapeamento com o texto original
  let normalized = '';
  const origIndex: number[] = [];
  [...source].forEach((char, i) => {
    const n = normalize(char);
    normalized += n;
    for (let k = 0; k < n.length; k++) origIndex.push(i);
  });
  const chars = [...source];

  const ranges: [number, number][] = [];
  if (q) {
    let from = 0;
    let found: number;
    while ((found = normalized.indexOf(q, from)) !== -1) {
      ranges.push([origIndex[found], origIndex[found + q.length - 1] + 1]);
      from = found + q.length;
    }
  }

  let start = 0;
  let end = chars.length;
  if (maxLength && chars.length > maxLength) {
    const first = ranges[0]?.[0] ?? 0;
    start = Math.max(0, Math.min(first - 20, chars.length - maxLength));
    end = Math.min(chars.length, start + maxLength);
  }

  const segments: TextSegment[] = [];
  const push = (from: number, to: number, match: boolean) => {
    const a = Math.max(from, start);
    const b = Math.min(to, end);
    if (a < b) segments.push({ text: chars.slice(a, b).join(''), match });
  };

  let cursor = 0;
  for (const [a, b] of ranges) {
    push(cursor, a, false);
    push(a, b, true);
    cursor = b;
  }
  push(cursor, chars.length, false);

  if (start > 0) segments.unshift({ text: '…', match: false });
  if (end < chars.length) segments.push({ text: '…', match: false });

  return segments;
}
