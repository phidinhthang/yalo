import { useCallback, useRef } from 'react';
import { SanitizeFn } from '../types/types';

export function useSanitize() {
  const sanitizeFnsRef = useRef<SanitizeFn[]>([]);

  const sanitizedTextRef = useRef('');

  const addSanitizeFn = useCallback((fn: SanitizeFn) => {
    sanitizeFnsRef.current.push(fn);
  }, []);

  const sanitize = useCallback((html: string) => {
    let result = sanitizeFnsRef.current.reduce((acc, fn) => {
      return fn(acc);
    }, html);

    result = replaceAllHtmlToString(result);

    sanitizedTextRef.current = result;

    return result;
  }, []);

  return { addSanitizeFn, sanitize, sanitizedTextRef };
}

export function replaceAllHtmlToString(html: string) {
  const container = document.createElement('div');
  container.innerHTML = html;

  let text = container.innerText || '';

  text = text.replace(/\n/gi, '');

  return text;
}
