import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

const isBrowser: boolean = typeof window !== 'undefined';

export function persistedStore<T>(key: string, initialValue: T): Writable<T> {
	const storedValue = isBrowser ? localStorage.getItem(key) : null;
	const value: T = storedValue ? JSON.parse(storedValue) : initialValue;
	const store: Writable<T> = writable(value);

	if (isBrowser) {
		store.subscribe((newValue: T) => {
			localStorage.setItem(key, JSON.stringify(newValue));
		});
	}

	return store;
}
