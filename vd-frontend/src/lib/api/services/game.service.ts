import { Socket, io } from 'socket.io-client';
import { characterId, jwt } from '$lib/store/auth';
import { handleMoveCorrection, player } from '$lib/store/player';
import {
	characters,
	handlePositionUpdate,
	inititalize,
	removeCharacter,
	spawnCharacter
} from '$lib/store/characters';
import PartyInviteWindow from '$lib/components/windows/PartyInviteWindow.svelte';

import type { Character } from '$lib/class/Character';
import type { GameInstance } from '$lib/class/GameInstance';
import type { MoveResponseDto } from '../dto/game.dto';
import type { SerializedInventoryDto } from '../dto/inventory.dto';
import { get } from 'svelte/store';
import { initializeInventory } from '$lib/store/inventory';
import { location } from '$lib/store/location';
import { socket } from '$lib/store/ws';
import { goto } from '$app/navigation';
import type { Stats } from '$lib/class/Stats';
import {
	entityOnPosition,
	inititalizeEntities,
	processAttackLogForEntity
} from '$lib/store/entities';
import { Collision, Tile, type AttackLog, type SingleAttackLog } from '$lib/util/types';
import { showDamageEffect, showDodgeEffect, showStatusEffects } from '$lib/store/viewport-effects';
import { dialogueState, progressDialogue } from '$lib/store/dialogue';
import { entityTracker } from '$lib/store/entity-tracker';
import type { Item } from '$lib/class/Item';
import { notifications } from '$lib/store/notifications';
import { isInParty, party } from '$lib/store/party';
import { windows } from '$lib/store/windows';
import { chat } from '$lib/store/chat';

type direction = 'up' | 'down' | 'left' | 'right';

const DEBUG_WS = true;

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
		console.log(data);
		if (DEBUG_WS) console.log('getInstance', data);
		console.log('dungeon depth:', data.depth);
		location.set(data.location);
		inititalize(data.characters);
		inititalizeEntities(data.entities);
		entityTracker.set(null);
		chat.clear();
	});

	client.on('getInventory', (data: SerializedInventoryDto) => {
		initializeInventory(data);
		if (DEBUG_WS) console.log('getInventory', data);
	});

	client.on('getPlayerCharacter', (data: Character) => {
		if (DEBUG_WS) console.log('getPlayerCharacter', data);
		player.set(data);
	});

	client.on('getStats', (data: Stats) => {
		if (DEBUG_WS) console.log('getStats', data);
		player.update((prev) => {
			if (!prev) return prev;

			return {
				...prev,
				stats: data
			};
		});
	});

	client.on('moveCorrection', (data: MoveResponseDto) => {
		if (DEBUG_WS) console.log(`moveResponse:`, data);
		handleMoveCorrection(data);
	});

	client.on('characterMoved', (data) => {
		if (DEBUG_WS) console.log(`characterMoved:`, data);
		handlePositionUpdate(data);
	});

	client.on('connect', () => {
		if (DEBUG_WS) console.log(`connected to game server with id ${get(characterId)}`);
	});

	client.on('disconnect', () => {
		disconnectFromServer();
		goto('/account');
	});

	client.on('spawnCharacter', (data: Character) => {
		if (DEBUG_WS) console.log('spawn character', data);
		spawnCharacter(data);
	});

	client.on('removeCharacter', (data: number) => {
		removeCharacter(data);
	});

	client.on('attackLog', (attackLog: AttackLog) => {
		console.log('attack log', attackLog);
		processAttackLog(attackLog);
	});

	client.on('itemDropped', (item: Item) => {
		console.log('item dropped', item);
		notifications.notifyItemDropped(item);
	});

	client.on('lootGold', ({ goldGained }: { goldGained: number }) => {
		notifications.notifyGoldLooted(goldGained);
	});

	client.on('lootShards', ({ shardsGained }: { shardsGained: number }) => {
		notifications.notifyShardsLooted(shardsGained);
	});

	client.on(
		'partyUpdate',
		(data: {
			id: number;
			members: number[];
			voting: null | 'nextLevel' | 'quit';
			votes: number[];
		}) => {
			if (DEBUG_WS) console.log('partyUpdate', data);
			const charactersMap = get(characters);
			const partyMembers = data.members.map((memberId) => ({
				id: memberId,
				name: charactersMap.get(memberId)?.name || 'Unknown'
			}));
			party.setParty({
				...data,
				members: partyMembers
			});
		}
	);

	client.on('partyInvite', (data) => {
		if (DEBUG_WS) console.log('partyInvite', data);
		windows.openWindow({
			id: `party-invite-${data.inviterId}`,
			title: 'Party Invitation',
			component: PartyInviteWindow,
			props: {
				inviterId: data.inviterId,
				inviterName: data.inviterName
			}
		});
	});

	client.on('partyInviteRejected', (inviteeName) => {
		if (DEBUG_WS) console.log('partyInviteRejected', inviteeName);
	});

	client.on('nextLevelVoteStarted', (data) => {
		if (DEBUG_WS) console.log('nextLevelVoteStarted', data);
		party.startVoting('nextLevel');
	});

	client.on('voteUpdate', (data: { votes: number[] }) => {
		if (DEBUG_WS) console.log('voteUpdate', data);
		party.endVoting();
		data.votes.forEach((voterId) => party.addVote(voterId));
	});

	client.on('nextLevelVoteCancelled', (data) => {
		if (DEBUG_WS) console.log('voteUpdate', data);
		party.endVoting();
	});

	client.on('chatInstanceMessage', (data) => {
		chat.addMessage(data);
	});
}

export function sendInstanceMessage(message: string) {
	const client = get(socket);
	if (!client) return;

	client.emit('sendInstanceMessage', message);
}

export function inviteToParty(inviteeId: number) {
	const client = get(socket);
	if (!client) return;

	client.emit('inviteToParty', { inviteeId });
}

export function respondToPartyInvite(accepted: boolean, inviterId: number) {
	const client = get(socket);
	if (!client) return;

	client.emit('respondToPartyInvite', { accepted, inviterId });
}

export function leaveParty() {
	const client = get(socket);
	if (!client) return;

	party.reset();

	client.emit('leaveParty');
}

export function voteNextLevel() {
	const client = get(socket);
	if (!client) return;

	client.emit('voteNextLevel');
}

export function exitDungeon() {
	const client = get(socket);
	if (!client) return;

	client.emit('exitDungeon');
}

export function disconnectFromServer() {
	const client = get(socket);
	if (!client) return;

	client.disconnect();
	socket.set(null);
}

export function movePlayer(dir: direction) {
	if (get(dialogueState).currentId !== null) return;

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

	if (currentLocation.collisionMap[newY][newX] !== Collision.BAD) {
		player.update((prev) => {
			const client = get(socket);
			if (prev == null || !client) return prev;

			const newPos = {
				instanceId: prev.pos.instanceId,
				x: newX,
				y: newY
			};

			if (currentLocation.terrain[newY][newX] === Tile.STAIRS) {
				if (!get(isInParty)) location.set(null);
			}

			client.emit('move', { x: newX, y: newY });

			return { ...prev, pos: newPos };
		});
	} else {
		const entity = entityOnPosition(newX, newY);

		if (entity && entity.type == 'monster') {
			console.log('trying to attack: ', { entityId: entity.id });
			const client = get(socket);
			client?.emit('attackEntity', { entityId: entity.id });
		} else if (entity && entity.type == 'npc' && entity.id === 0) {
			console.log('talk with merchant');

			progressDialogue(0);
		} else if (entity && entity.type == 'npc' && entity.id === 1) {
			console.log('talk with doctor');
			progressDialogue(100);
		}
	}
}

export function processAttackLog(attackLog: AttackLog) {
	const { characterId, entityId, characterAttacks, entityAttacks, characterDied } = attackLog;

	const currentPlayerIsAttacker = get(player)?.id === characterId;

	// Process character's attacks
	characterAttacks.forEach((attack) => {
		processAttack(attack, entityId, 'entity');
	});

	// Process entity's attacks
	entityAttacks.forEach((attack) => {
		processAttack(attack, characterId, 'character');
	});

	if (currentPlayerIsAttacker && !characterDied) {
		// Update player stats
		player.update((prev) => {
			if (!prev) return prev;
			prev.stats.hp = Math.max(prev.stats.hp - getTotalDamage(entityAttacks), 0);
			return prev;
		});
	}

	processAttackLogForEntity(attackLog);
}

function processAttack(
	attack: SingleAttackLog,
	targetId: number,
	targetType: 'character' | 'entity'
) {
	if (attack.dodged) {
		showDodgeEffect(targetId, targetType);
	} else {
		showDamageEffect(attack.damageDone, targetId, targetType, attack.criticalHit);
		showStatusEffects(attack.effectsApplied, targetId, targetType);
	}
}

function getTotalDamage(attacks: SingleAttackLog[]): number {
	return attacks.reduce((total, attack) => total + attack.damageDone, 0);
}
