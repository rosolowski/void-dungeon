<script lang="ts">
	import { sendInstanceMessage } from '$lib/api/services/game.service';
	import { dialogueState } from '$lib/store/dialogue';
	import { chat } from '$lib/store/chat';
	import { onMount } from 'svelte';

	let inputMessage = '';
	let inputElement: HTMLInputElement;
	let messagesContainer: HTMLDivElement;

	function activateChat() {
		if (!$chat.isActive) {
			setActive(true);
			setTimeout(() => inputElement?.focus(), 5);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !$chat.isActive) {
			activateChat();
		} else if (event.key === 'Escape' && $chat.isActive) {
			closeChat();
		}
	}

	function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && inputMessage.trim()) {
			chat.addMessage({ from: '(You)', message: inputMessage.trim() });
			sendInstanceMessage(inputMessage.trim());
			inputMessage = '';
			event.stopPropagation();
		} else if (event.key === 'Enter' && !inputMessage.trim()) {
			event.stopPropagation();
			closeChat();
		}
	}

	function closeChat() {
		setActive(false);
	}

	function setActive(active: boolean) {
		chat.setActive(active);
	}

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	$: if ($chat.messages.length > 0) {
		setTimeout(scrollToBottom, 0);
	}

	onMount(() => {
		return () => {
			setActive(false);
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $dialogueState.currentId === null}
	<div class="chat-container" class:active={$chat.isActive}>
		{#if $chat.isActive}
			<button class="close-button" on:click={closeChat}>[x]</button>
			<div class="messages" bind:this={messagesContainer}>
				{#if $chat.messages.length > 0}
					{#each $chat.messages as message}
						<div class="message">
							<strong>{message.from}:</strong>
							{message.message}
						</div>
					{/each}
				{:else}
					<div class="message">Silence...</div>
				{/if}
			</div>
			<input
				bind:this={inputElement}
				bind:value={inputMessage}
				on:keydown={handleInputKeydown}
				type="text"
				placeholder="Type a message..."
			/>
		{:else if $chat.messages.length > 0}
			<div class="last-message" on:click={activateChat}>
				<strong>{$chat.messages[$chat.messages.length - 1].from}:</strong>
				{$chat.messages[$chat.messages.length - 1].message}
			</div>
		{:else}
			<div class="last-message" on:click={activateChat}>Chat</div>
		{/if}
	</div>
{/if}

<style>
	.chat-container {
		position: absolute;
		display: flex;
		flex-direction: column;
		bottom: 20px;
		right: 20px;
		width: 300px;
		background-color: var(--background);
		border: 1px solid var(--tetriary);
		transition: transform 0.3s ease;
		z-index: var(--zi-chat);
		user-select: none;
	}

	.chat-container:not(.active) {
		min-height: 20px;
		opacity: 0.5;
		user-select: none;
		cursor: pointer;
	}

	.chat-container.active {
		height: 400px;
		transform: translateY(-20px);
		bottom: 0px;
	}

	.close-button {
		position: absolute;
		top: 5px;
		right: 5px;
		border: none;
		cursor: pointer;
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 10px;
	}

	.message {
		margin-bottom: 10px;
	}

	input {
		width: 100%;
		padding: 10px;
		border: none;
		outline: none;
		background-color: var(--background);
		color: var(--primary);
		border-top: 1px solid var(--tetriary);
		font-family: var(--font-mono);
	}

	.last-message {
		padding: 10px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
