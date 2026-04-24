import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'global',
});

export const storageService = {
  set: (key: string, value: string) => {
    storage.set(key, value);
  },
  get: (key: string) => {
    return storage.getString(key);
  },
  remove: (key: string) => {
    storage.remove(key);
  },
  clearAll: () => {
    storage.clearAll();
  },
};
