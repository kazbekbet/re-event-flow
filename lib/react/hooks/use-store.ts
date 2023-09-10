import { useSyncExternalStore } from 'use-sync-external-store/shim';

import type { Store } from '../../core';

export function useStore<Val>(store: Store<Val>) {
  return useSyncExternalStore(store.subscribe, store.getState);
}
