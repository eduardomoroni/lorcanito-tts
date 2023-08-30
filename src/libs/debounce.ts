export function debounce<T extends Function>(cb: T, wait = 20) {
  let timerId = 0;
  const callable = (...args: unknown[]) => {
    clearTimeout(timerId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    timerId = setTimeout(() => cb(...args), wait) as unknown as number;
  };
  return <T>(<unknown>callable);
}
