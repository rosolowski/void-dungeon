import type { Entity } from '$lib/class/Entity';
import { get, writable } from 'svelte/store';
import { entities } from './entities';

export const entityTracker = writable<Entity | null>(null);

export function refreshEntityTracker() {
	const trackedEntity = get(entityTracker);

	if (!trackedEntity) return;

	const actualValue = get(entities).get(trackedEntity.id);

	if (!actualValue) entityTracker.set(null);
	else entityTracker.set(actualValue);

	entityTracker.update((prev) => {
		if (!prev) return prev;

		return { ...prev };
	});
}
