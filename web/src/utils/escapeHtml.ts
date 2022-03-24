import { escape } from 'html-escaper';

export function escapeHtml(unsafe: string) {
  return escape(unsafe);
}
