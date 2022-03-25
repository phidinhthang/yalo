export function testId(id: string | number) {
  return {
    'data-testid': import.meta.env.VITE_ENV === 'production' ? undefined : id,
  };
}
