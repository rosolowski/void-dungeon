import { Entity } from '$lib/class/Entity';
import { Stats } from '$lib/class/Stats';
import { writable } from 'svelte/store';

const initEntities = [
	new Entity(0, 'monster', { x: 1, y: 2, instanceId: 0 }, 'big frog', 5, new Stats()),
	new Entity(1, 'monster', { x: 2, y: 2, instanceId: 0 }, 'big frog', 5, new Stats())
];

export const entities = writable<Entity[]>(initEntities);
