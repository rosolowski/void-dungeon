import { get, writable } from 'svelte/store';
import { Character } from '$lib/class/Character';
import type { MoveResponseDto } from '$lib/api/dto/game.dto';
import { skillManager } from '$lib/store/skill-manager';

function createPlayerStore() {
	const { subscribe, set: originalSet, update } = writable<Character | null>(null);

	return {
		subscribe,
		set: (value: Character | null) => {
			const currentPlayer = get({ subscribe });
			const newLevel = value?.level;
			const oldLevel = currentPlayer?.level;

			originalSet(value);

			if (newLevel && oldLevel && newLevel > oldLevel) {
				levelUp.set(true);
			}

			if (value && value.skillIds) {
				skillManager.updatePlayerSkills(value.skillIds);
			}
		},
		update
	};
}

export const player = createPlayerStore();

export const levelUp = writable(false);

export function handleMoveCorrection(data: MoveResponseDto) {
	const currentPlayer = get(player);
	const { newX, newY } = data;

	if (!data.success && currentPlayer) {
		currentPlayer.pos.x = newX;
		currentPlayer.pos.y = newY;

		player.set(currentPlayer);
	}
}
