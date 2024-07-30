import type { AttackLog } from '$lib/api/services/game.service';
import type { Character } from '$lib/class/Character';
import { get, writable } from 'svelte/store';
import { player } from './player';
import { characters } from './characters';
import { entities } from './entities';
import type { Entity } from '$lib/class/Entity';

type FightNumberType = 'DAMAGE' | 'HEAL' | 'POISON' | 'FIRE';

export interface FightNumber {
	x: number;
	y: number;
	value: number;
	type: FightNumberType;
}

let fightNumbersCounter = 0;

export const fightNumbers = writable<Map<number, FightNumber>>(new Map());

export function attackLogToFightNumbers(attackLog: AttackLog) {
	const characterTarget: Character | undefined =
		get(player)?.id === attackLog.characterId
			? (get(player) as Character)
			: get(characters).get(attackLog.characterId);

	const entityTarget: Entity | undefined = get(entities).get(attackLog.entityId);

	if (characterTarget && attackLog.characterDamageTaken > 0) {
		const fnId = fightNumbersCounter++;

		const fightNumberCharacter: FightNumber = {
			type: 'DAMAGE',
			value: -attackLog.characterDamageTaken,
			x: characterTarget.pos.x,
			y: characterTarget.pos.y
		};

		fightNumbers.update((prev) => {
			if (!prev) return prev;
			const newMap = new Map(prev);
			newMap.set(fnId, fightNumberCharacter);

			return newMap;
		});

		setTimeout(() => {
			fightNumbers.update((prev) => {
				if (!prev) return prev;
				const newMap = new Map(prev);
				newMap.delete(fnId);

				return newMap;
			});
		}, 1000);
	}

	if (entityTarget && attackLog.entityDamageTaken > 0) {
		const fnId = fightNumbersCounter++;

		const fightNumberEntity: FightNumber = {
			type: 'DAMAGE',
			value: -attackLog.entityDamageTaken,
			x: entityTarget.pos.x,
			y: entityTarget.pos.y
		};

		fightNumbers.update((prev) => {
			if (!prev) return prev;
			const newMap = new Map(prev);
			newMap.set(fnId, fightNumberEntity);

			return newMap;
		});

		setTimeout(() => {
			fightNumbers.update((prev) => {
				if (!prev) return prev;
				const newMap = new Map(prev);
				newMap.delete(fnId);

				return newMap;
			});
		}, 1000);
	}
}
