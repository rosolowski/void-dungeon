<script lang="ts">
	import { dialogueState, progressDialogue, selectOption } from '$lib/store/dialogue';
	import { onMount } from 'svelte';

	function handleKeydown(event: KeyboardEvent) {
		if (
			event.code === 'Space' &&
			$dialogueState.currentLine &&
			$dialogueState.currentLine.options.length === 0
		) {
			event.preventDefault();
			progressDialogue($dialogueState.currentId! + 1);
		}
	}

	function handleClick() {
		if ($dialogueState.currentLine && $dialogueState.currentLine.options.length === 0) {
			progressDialogue($dialogueState.currentId! + 1);
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if $dialogueState.currentLine}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="dialogue" on:click={handleClick}>
		<div class="dialogue-content">
			<div class="dialogue-text">{$dialogueState.currentLine.text}</div>
			{#if $dialogueState.currentLine.options.length > 0}
				<div class="dialogue-options">
					{#each $dialogueState.currentLine.options as option, i}
						<button class="dialogue-option" on:click|stopPropagation={() => selectOption(i)}>
							{i + 1}. {option.text}
						</button>
					{/each}
				</div>
			{:else}
				<div class="dialogue-continue">Click or press spacebar to continue</div>
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.dialogue {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		z-index: var(--zi-dialogue);
	}

	.dialogue-content {
		background-color: rgba(0, 0, 0, 0.5);
		padding: 20px;
		margin: 20px;
		border: 1px solid var(--tetriary);
		color: white;
		cursor: pointer;
	}

	.dialogue-text {
		font-size: 18px;
		line-height: 1.5;
		margin-bottom: 20px;
	}

	.dialogue-options {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.dialogue-option {
		border: 1px solid var(--tetriary);
		border-radius: 2px;
		color: var(--secondary);
		padding: 10px 15px;
		font-size: 16px;
		cursor: pointer;
		text-align: left;

		&:hover {
			background-color: var(--tetriary);
		}

		&:focus {
			outline: none;
		}
	}

	.dialogue-continue {
		font-size: 14px;
		color: #aaa;
		text-align: center;
		margin-top: 10px;
	}
</style>
