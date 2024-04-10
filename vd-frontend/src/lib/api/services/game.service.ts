import { Socket, io } from 'socket.io-client';
import { characterId, jwt } from '$lib/store/auth';
import { handleMoveCorrection, player } from '$lib/store/player';
import {
	handlePositionUpdate,
	inititalize,
	removeCharacter,
	spawnCharacter
} from '$lib/store/characters';

import type { Character } from '$lib/class/Character';
import type { GameInstance } from '$lib/class/GameInstance';
import type { Inventory } from '$lib/class/Inventory';
import type { Item } from '$lib/class/Item';
import type { MoveResponseDto } from '../dto/game.dto';
import { PUBLIC_API_HOST } from '$env/static/public';
import type { SerializedInventoryDto } from '../dto/inventory.dto';
import { get } from 'svelte/store';
import { initializeInventory } from '$lib/store/inventory';
import { location } from '$lib/store/location';
import { socket } from '$lib/store/ws';
import { goto } from '$app/navigation';
import type { Stats } from '$lib/class/Stats';

type directions = 'up' | 'down' | 'left' | 'right';

export function initializeServerConnection() {
	let client = get(socket);

	if (!client) {
		socket.set(
			io(`http://localhost:3000?characterId=${get(characterId)}`, {
				auth: { token: `Bearer ${get(jwt)}` }
			})
		);
		client = get(socket) as Socket;
	}

	client.on('connect_error', (error) => {
		console.error('Connection error:', error);
		goto('/account');
	});

	client.on('error', (error) => {
		console.error('Server error:', error);
	});

	client.on('getInstance', (data: GameInstance) => {
		console.log('getInstance', data);
		location.set(data.location);
		inititalize(data.characters);
	});

	client.on('getInventory', (data: SerializedInventoryDto) => {
		initializeInventory(data);
		console.log('getInventory', data);
	});

	client.on('getPlayerCharacter', (data: Character) => {
		console.log('getPlayerCharacter', data);
		player.set(data);
	});

	client.on('getStats', (data: Stats) => {
		console.log('getStats', data);
		player.update((prev) => {
			if (!prev) return prev;

			return {
				...prev,
				stats: data
			};
		});
	});

	client.on('moveCorrection', (data: MoveResponseDto) => {
		console.log(`moveResponse:`, data);
		handleMoveCorrection(data);
	});

	client.on('characterMoved', (data) => {
		console.log(`characterMoved:`, data);
		handlePositionUpdate(data);
	});

	client.on('connect', () => {
		console.log(`connected to game server with id ${get(characterId)}`);
	});

	client.on('disconnect', () => {
		disconnectFromServer();
		goto('/account');
	});

	client.on('spawnCharacter', (data: Character) => {
		console.log('spawn character', data);
		spawnCharacter(data);
	});

	client.on('removeCharacter', (data: number) => {
		removeCharacter(data);
	});
}

export function disconnectFromServer() {
	const client = get(socket);
	if (!client) return;

	client.disconnect();
	socket.set(null);
}

export function movePlayer(dir: directions) {
	const currentPlayer = get(player);
	const currentLocation = get(location);

	if (!currentPlayer || !currentLocation) return;

	let newX: number = currentPlayer.pos.x;
	let newY: number = currentPlayer.pos.y;

	switch (dir) {
		case 'up':
			newY--;
			break;
		case 'down':
			newY++;
			break;
		case 'left':
			newX--;
			break;
		case 'right':
			newX++;
			break;
	}

	if (currentLocation.collisionMap[newY][newX] !== 0)
		player.update((prev) => {
			const client = get(socket);
			if (prev == null || !client) return prev;

			const newPos = {
				instanceId: prev.pos.instanceId,
				x: newX,
				y: newY
			};

			client.emit('move', { x: newX, y: newY });

			return { ...prev, pos: newPos };
		});
}

export async function fetchPlayer() {
	const token = get(jwt);

	const res = await fetch(`${PUBLIC_API_HOST}/game/player-character`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ characterId: get(characterId) })
	});
	if (!res.ok) {
		throw new Error('Failed to fetch player character');
	}
	return res.json();
}
