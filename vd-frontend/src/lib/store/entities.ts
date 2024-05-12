import { Entity } from '$lib/class/Entity';
// import { Stats } from '$lib/class/Stats';
import { get, writable } from 'svelte/store';

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

export function removeEntity(id: number): Entity | undefined {
	let entity: Entity | undefined;
	entities.update((currentEntities) => {
		const newEntities = new Map(currentEntities);
		entity = newEntities.get(id);
		newEntities.delete(id);
		console.log('new eneities: ', newEntities);
		return newEntities;
	});

	return entity;
}

export function entityOnPosition(x: number, y: number): Entity | null {
	const currentEntities = get(entities);
	for (const entity of currentEntities.values()) {
		if (entity.pos.x === x && entity.pos.y === y) return entity;
	}

	return null;
}
