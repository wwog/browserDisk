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

export function isFileHandle(
  handle: FileSystemHandle
): handle is FileSystemFileHandle {
  return handle.kind === 'file';
}

export function isDirectoryHandle(
  handle: FileSystemHandle
): handle is FileSystemDirectoryHandle {
  return handle.kind === 'directory';
}

export function asyncIteratorToArray<T>(
  asyncIterator: AsyncIterable<T>
): Promise<T[]> {
  const result: T[] = [];
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        for await (const item of asyncIterator) {
          result.push(item);
        }
        resolve(result);
      } catch (e) {
        reject(e);
      }
    })();
  });
}

export function PromiseWithResolvers<T = void>() {
  let resolve: (value: T) => void = null as unknown as (value: T) => void;
  let reject: (reason?: any) => void = null as unknown as (
    reason?: any
  ) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

export function safeIsSecureContext(restrain = true): boolean {
  if (self.isSecureContext !== undefined) {
    return self.isSecureContext;
  }
  // Compatibility with older browsers
  if (self.location) {
    if (self.location.protocol === 'https:') {
      return true;
    } else if (self.location.protocol === 'http:') {
      return false;
    }
  }
  if (restrain === false) {
    throw new Error(
      `Unable to determine if running in a secure context, if you are running in a Node.js environment, you can ignore this error`
    );
  }
  return false;
}

/**
 *  Contains a randomly generated, 36-character, version 4 UUID string.
 */
export function safeRandomUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
