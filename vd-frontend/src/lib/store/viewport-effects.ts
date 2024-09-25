import type { StatusEffects } from '$lib/util/types';
import type { Character } from '$lib/class/Character';
import { get, writable } from 'svelte/store';
import { player } from './player';
import { characters } from './characters';
import { entities } from './entities';
import type { Entity } from '$lib/class/Entity';

export interface SkillEffect {
	type: 'skill';
	id: string;
	x: number;
	y: number;
}

type FightNumberType =
	| 'DAMAGE'
	| 'HEAL'
	| 'POISON'
	| 'FIRE'
	| 'COLD'
	| 'LIGHT'
	| 'VOID'
	| 'DODGE'
	| 'CRITICAL';

export interface FightNumber {
	x: number;
	y: number;
	value: number;
	type: FightNumberType;
}

export type ViewportEffect = FightNumber | SkillEffect;

let fightNumbersCounter = 0;

export const viewportEffects = writable<Map<number, ViewportEffect>>(new Map());

function addFightNumber(fightNumber: FightNumber) {
	const fnId = fightNumbersCounter++;

	viewportEffects.update((prev) => {
		if (!prev) return prev;
		const newMap = new Map(prev);
		newMap.set(fnId, fightNumber);
		return newMap;
	});

	setTimeout(() => {
		viewportEffects.update((prev) => {
			if (!prev) return prev;
			const newMap = new Map(prev);
			newMap.delete(fnId);
			return newMap;
		});
	}, 1000);
}

export function showHealEffect(heal: number, targetId: number, targetType: 'character' | 'entity') {
	const target = getTarget(targetId, targetType);
	if (target) {
		addFightNumber({
			type: 'HEAL',
			value: heal,
			x: target.pos.x,
			y: target.pos.y
		});
	}
}

export function showDamageEffect(
	damage: number,
	targetId: number,
	targetType: 'character' | 'entity',
	isCritical: boolean
) {
	const target = getTarget(targetId, targetType);
	if (target && damage > 0) {
		addFightNumber({
			type: isCritical ? 'CRITICAL' : 'DAMAGE',
			value: -damage,
			x: target.pos.x,
			y: target.pos.y
		});
	}
}

export function showDodgeEffect(targetId: number, targetType: 'character' | 'entity') {
	const target = getTarget(targetId, targetType);
	if (target) {
		addFightNumber({
			type: 'DODGE',
			value: 0,
			x: target.pos.x,
			y: target.pos.y
		});
	}
}

export function showStatusEffects(
	effects: StatusEffects,
	targetId: number,
	targetType: 'character' | 'entity'
) {
	const target = getTarget(targetId, targetType);
	if (target) {
		Object.entries(effects).forEach(([effectType, value]) => {
			if (value > 0) {
				addFightNumber({
					type: effectType.toUpperCase() as FightNumberType,
					value: -value,
					x: target.pos.x,
					y: target.pos.y
				});
			}
		});
	}
}

export function showSkillEffect(skillId: string, x: number, y: number) {
	const effectId = fightNumbersCounter++;

	viewportEffects.update((prev) => {
		const newMap = new Map(prev);
		newMap.set(effectId, { type: 'skill', id: skillId, x, y });
		return newMap;
	});

	setTimeout(() => {
		viewportEffects.update((prev) => {
			const newMap = new Map(prev);
			newMap.delete(effectId);
			return newMap;
		});
	}, 1000);
}

function getTarget(
	targetId: number,
	targetType: 'character' | 'entity'
): Character | Entity | null | undefined {
	if (targetType === 'character') {
		return get(player)!.id === targetId ? get(player) : get(characters).get(targetId);
	} else {
		return get(entities).get(targetId);
	}
}
