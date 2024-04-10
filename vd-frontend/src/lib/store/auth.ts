import { User } from '$lib/class/User';
import { persistedStore } from '$lib/util/persisted-store';

export const jwt = persistedStore<string | null>('jwt', null);

export const user = persistedStore<User | null>('user', null);

export const characterId = persistedStore<number | null>('characterId', null);
