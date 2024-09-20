import { get, writable } from 'svelte/store';

import { Character } from '$lib/class/Character';
import type { MoveResponseDto } from '$lib/api/dto/game.dto';

function createPlayerStore() {
	const { subscribe, set, update } = writable<Character | null>(null);

	return {
		subscribe,
		set: (value: Character | null) => {
			const currentPlayer = get({ subscribe });
			const newLevel = value?.level;
			const oldLevel = currentPlayer?.level;

			set(value);

			if (newLevel && oldLevel && newLevel > oldLevel) {
				levelUp.set(true);
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
		// console.log('player not synced - updating x and y position');
		currentPlayer.pos.x = newX;
		currentPlayer.pos.y = newY;

		player.set(currentPlayer);
	}
}
