<script lang="ts">
	import { goto } from '$app/navigation';
	import { removeCharacter } from '$lib/api/services/character-manager.service';
	import type { Character } from '$lib/class/Character';
	import AvatarComponent from '$lib/components/shared/AvatarComponent.svelte';
	import { characterId } from '$lib/store/auth';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let character: Character;

	let removing: boolean = false;
	let nameConfirmation: string = '';

	async function removeCharacterHandler() {
		if (nameConfirmation !== character.name) return;

		await removeCharacter({ characterId: character.id });
		removing = false;
		dispatch('charactersUpdated');
	}

	function playHandler() {
		characterId.set(character.id);
		goto('/game');
	}
</script>

{#if removing}
	<div class="popup">
		<div class="remove-confirmation">
			<div class="remove-confirmation__text">
				<h3>Warning!</h3>
				<span>You will lose all your progress and delete this character.</span>
				<br />
				<span>To confirm enter this character's name: {character.name}</span>
			</div>

			<input type="text" name="vd-class" id="class-input" bind:value={nameConfirmation} />

			<div class="actions">
				<button
					on:click={() => {
						removing = false;
					}}>[Cancel]</button
				>
				<button class="danger" on:click={removeCharacterHandler}>[DELETE]</button>
			</div>
		</div>
	</div>
{/if}

<div class="character-block">
	<div class="avatar-wrapper">
		<AvatarComponent avatar={character.avatar} />
	</div>

	<div class="desc">
		<div class="char-i char-name">{character.name}</div>

		<div class="char-i char-level">lvl {character.level}</div>

		<div class="char-i char-class">{character.charClass}</div>
	</div>

	<div class="actions">
		<button
			class="danger"
			on:click={() => {
				removing = true;
			}}>[X]</button
		>
		<button class="good" on:click={playHandler}>[PLAY]</button>
	</div>
</div>

<style lang="scss">
	.character-block {
		border: 1px solid var(--tetriary);
		display: flex;
		flex-direction: column;
		width: 180px;
		overflow: hidden;
		transition: box-shadow 0.4s ease;

		.avatar-wrapper {
			position: relative;
			width: 100%;
			height: 180px;
			border-bottom: 1px solid var(--tetriary);
		}

		.desc {
			padding: 5px 10px;

			.char-i {
				padding-bottom: 5px;
				max-width: 100%;
				overflow: hidden;
				word-break: break-all;
			}

			.char-name {
				font-size: 16px;
			}

			.char-level {
				color: var(--secondary);
			}

			.char-class {
				color: var(--secondary);
			}
		}

		&:hover {
			cursor: pointer;
			box-shadow:
				0 0 4px var(--secondary),
				0 0 16px var(--secondary);
			transition: none;
		}
	}

	.remove-confirmation {
		padding: 15px;

		input {
			margin: 15px 0 30px 0;
		}
	}

	.actions {
		width: 100%;
		padding: 5px;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 15px;
		flex: 1;
	}
</style>
