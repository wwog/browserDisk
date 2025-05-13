import { createExternalState } from './createExternalState';

export function createStorageState<T>(
  key: string,
  initialState: T,
  storageType: 'localStorage' | 'sessionStorage' = 'localStorage'
) {
  const storage =
    storageType === 'localStorage' ? localStorage : sessionStorage;
  const storageState = createExternalState<T>(
    () => {
      const storedState = storage.getItem(key);
      return storedState ? JSON.parse(storedState) : initialState;
    },
    (newState) => {
      storage.setItem(key, JSON.stringify(newState));
    }
  );

  return storageState;
}
