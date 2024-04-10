import { get, writable } from 'svelte/store';

import { Character } from '$lib/class/Character';
import type { MoveResponseDto } from '$lib/api/dto/game.dto';

export const player = writable<Character | null>(null);

export function handleMoveCorrection(data: MoveResponseDto) {
	const currentPlayer = get(player);
	const { newX, newY } = data;

	if (!data.success && currentPlayer) {
		console.log('player not synced - updating x and y position');
		currentPlayer.pos.x = newX;
		currentPlayer.pos.y = newY;

		player.set(currentPlayer);
	}
}
