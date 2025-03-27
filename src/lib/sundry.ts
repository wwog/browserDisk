export function once<T extends (...args: any[]) => any>(
  fn: T
): {
  (...args: Parameters<T>): Promise<ReturnType<T> | undefined>;
  isRunning: () => boolean;
} {
  let isRunning = false;

  const wrappedFn = async function (
    this: any,
    ...args: Parameters<T>
  ): Promise<ReturnType<T> | undefined> {
    if (isRunning) return;
    isRunning = true;
    try {
      return await fn.apply(this, args);
    } finally {
      isRunning = false;
    }
  };

  const result = Object.assign(wrappedFn, {
    isRunning: () => isRunning,
  });

  return result;
}

export function byteToReadableStr(byte: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = 0;
  while (byte > 1024) {
    byte /= 1024;
    i++;
  }
  const truncated = Math.floor(byte * 100) / 100;
  return `${truncated.toFixed(2)} ${units[i]}`;
}
