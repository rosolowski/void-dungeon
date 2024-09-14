import { Location } from '$lib/class/Location';
import { writable } from 'svelte/store';

export const location = writable<Location | null>(null);

export const dungeonLevel = writable<number | null>(null);
