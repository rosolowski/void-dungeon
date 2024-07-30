import { Entity } from '$lib/class/Entity';
// import { Stats } from '$lib/class/Stats';
import { get, writable } from 'svelte/store';
import { type AttackLog } from '$lib/api/services/game.service';
import { location } from './location';
import { Collision } from '$lib/util/types';
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

export function processAttackLogForEntity(attackLog: AttackLog) {
	entities.update(currentEntities => {
			const entity = currentEntities.get(attackLog.entityId);

			if (attackLog.entityDied) {
					currentEntities.delete(attackLog.entityId);

					if (entity) {
							const { x, y } = entity.pos;
							location.update((prev) => {
									if (prev) prev.collisionMap[y][x] = Collision.WALKABLE;
									return prev;
							});
					}

					entityTracker.set(null);
			} else if (entity) {
					const updatedEntity = {
							...entity,
							stats: {
									...entity.stats,
									hp: entity.stats.hp - attackLog.entityDamageTaken
							}
					};
					currentEntities.set(attackLog.entityId, updatedEntity);

					if (get(entityTracker) === null) {
							entityTracker.set(updatedEntity);
					}
			}

			return new Map(currentEntities);
	});

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
