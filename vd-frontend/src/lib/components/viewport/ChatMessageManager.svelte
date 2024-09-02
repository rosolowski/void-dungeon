<script lang="ts">
	import { onDestroy } from 'svelte';
	import { chat } from '$lib/store/chat';
	import { characters } from '$lib/store/characters';
	import { player } from '$lib/store/player';
	import type { Character } from '$lib/class/Character';
	import type { Message } from '$lib/store/chat';
	import ChatMessage from './ChatMessage.svelte';

	interface VisibleMessage {
		id: number;
		character: Character;
		message: string;
		timestamp: number;
	}

	let messageIdCounter = 0;
	let visibleMessages: VisibleMessage[] = [];
	let processedMessageTimestamps = new Set<number>();

	function findCharacter(name: string): Character | undefined {
		if ($player && name === '(You)') {
			return $player;
		}
		return [...$characters.values()].find((character) => character.name === name);
	}

	function processNewMessages(messages: Message[]) {
		const now = Date.now();
		const newMessages = messages.filter((msg) => !processedMessageTimestamps.has(msg.timestamp));

		newMessages.forEach((msg) => {
			const character = findCharacter(msg.from);
			if (character) {
				visibleMessages = [
					...visibleMessages,
					{
						id: messageIdCounter++,
						character,
						message: msg.message,
						timestamp: msg.timestamp
					}
				];
				processedMessageTimestamps.add(msg.timestamp);
			}
		});

		visibleMessages = visibleMessages.filter((msg) => now - msg.timestamp < 5000);

		processedMessageTimestamps.forEach((timestamp) => {
			if (now - timestamp >= 5000) {
				processedMessageTimestamps.delete(timestamp);
			}
		});
	}

	$: processNewMessages($chat.messages);

	function removeVisibleMessage(id: number) {
		visibleMessages = visibleMessages.filter((msg) => msg.id !== id);
	}

	onDestroy(() => {
		visibleMessages = [];
		processedMessageTimestamps.clear();
	});
</script>

{#each visibleMessages as { id, character, message } (id)}
	<ChatMessage {character} {message} onRemove={() => removeVisibleMessage(id)} />
{/each}
