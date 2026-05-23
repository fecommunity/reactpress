import { create } from "zustand";
import type { StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import type { PersistOptions } from "zustand/middleware";

export interface PersistConfig<T> {
  name: string;
  version?: number;
  partialize?: PersistOptions<T, Partial<T>>["partialize"];
  merge?: PersistOptions<T, Partial<T>>["merge"];
}

/**
 * Factory function to create a Zustand store with persistence middleware
 * Reduces boilerplate for stores that need automatic data persistence
 */
export function createPersistentStore<T extends object>(
  initializer: StateCreator<T, [], []>,
  config: PersistConfig<T>,
) {
  const persistConfig: PersistOptions<T, Partial<T>> = {
    name: config.name,
    ...(config.version !== undefined && { version: config.version }),
    ...(config.merge && { merge: config.merge }),
    ...(config.partialize && { partialize: config.partialize }),
  };

  return create<T>()(persist(initializer, persistConfig));
}
