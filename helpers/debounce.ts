export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number = 300,
) => {
  let timeoutId: NodeJS.Timeout | null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(args);
    }, delay);
  };
};
