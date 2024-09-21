import type { Character } from '$lib/class/Character';
import type { Entity } from '$lib/class/Entity';

export enum Tile {
	EMPTY = 0,
	WALL = 1,
	FLOOR = 2,
	STAIRS = 3
}

export enum Collision {
	BAD = 0,
	WALKABLE = 1
}

export interface AttackLog {
	characterFinal: Character;
	entityFinal: Entity;
	characterAttacks: SingleAttackLog[];
	entityAttacks: SingleAttackLog[];
	characterDied: boolean;
	entityDied: boolean;
}

export interface SingleAttackLog {
	damageDone: number;
	effectsApplied: StatusEffects;
	criticalHit: boolean;
	dodged: boolean;
}

export interface StatusEffects {
	poison: number;
	fire: number;
	cold: number;
	light: number;
	void: number;
}
