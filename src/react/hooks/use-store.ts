import type { Store } from '../../core/store';
import { useSyncExternalStore } from 'use-sync-external-store';

export function useStore<Val>(store: Store<Val>) {
  return useSyncExternalStore(store.subscribe, store.getState);
}
