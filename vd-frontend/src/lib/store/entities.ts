import { Entity } from '$lib/class/Entity';
// import { Stats } from '$lib/class/Stats';
import { writable } from 'svelte/store';

// const initEntities = [
// 	new Entity(0, 'monster', { x: 1, y: 2, instanceId: 0 }, 'big frog', 5, new Stats()),
// 	new Entity(1, 'monster', { x: 2, y: 2, instanceId: 0 }, 'big frog', 5, new Stats())
// ];

export const entities = writable<Map<number, Entity>>(new Map());

export function inititalizeEntities(data: Array<Entity>) {
	const newEntities: Map<number, Entity> = new Map();
	for (const entity of data) {
		newEntities.set(entity.id, entity);
	}

	entities.set(newEntities);
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
		return newEntities;
	});
}
