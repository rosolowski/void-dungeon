import { Entity } from '$lib/class/Entity';
import { get, writable } from 'svelte/store';
import { entityTracker, refreshEntityTracker } from './entity-tracker';

export const entities = writable<Map<number, Entity>>(new Map());

export function inititalizeEntities(data: Array<Entity>) {
	const newEntities: Map<number, Entity> = new Map();
	for (const entity of data) {
		newEntities.set(entity.id, entity);
	}

	entities.set(newEntities);
	refreshEntityTracker();
}

export function spawnEntity(newEntity: Entity) {
	entities.update((currentEntities) => {
		const newEntities = new Map(currentEntities);
		newEntities.set(newEntity.id, newEntity);
		return newEntities;
	});
}

export function removeEntity(id: number) {
	entities.update((currentEntities) => {
		const newEntities = new Map(currentEntities);
		newEntities.delete(id);
		console.log('new entities: ', newEntities);
		return newEntities;
	});

	if (get(entityTracker)?.id === id) {
		entityTracker.set(null);
	}

	refreshEntityTracker();
}

export function entityOnPosition(x: number, y: number): Entity | null {
	const currentEntities = get(entities);
	for (const entity of currentEntities.values()) {
		if (entity.pos.x === x && entity.pos.y === y) return entity;
	}

	return null;
}
