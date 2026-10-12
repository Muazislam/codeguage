import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const memory = new Map<string, string>();

export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    memory.set(key, value);
  }
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      return memory.get(key) ?? null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

export async function deleteItem(key: string): Promise<void> {
  memory.delete(key);
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* ignore */
  }
}
