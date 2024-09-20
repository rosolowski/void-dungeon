<script lang="ts">
	import { addCharacter } from '$lib/api/services/character-manager.service';
	import type { CharacterAvatar } from '$lib/class/CharacterAvatar';
	import HeaderLoggedIn from '$lib/components/home/HeaderLoggedIn.svelte';
	import AvatarComponent from '$lib/components/shared/AvatarComponent.svelte';
	import { jwt, user } from '$lib/store/auth';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		if (!$jwt || !$user) {
			goto('/login');
		}
	});

	let characterName: string;
	let characterClass: ClassName | '' = '';

	type ClassName = 'Blood Knight' | 'Berserk' | 'Toxin Rogue' | 'Shadow Monk' | 'Battle Mage';

	const classOptions: ClassName[] = [
		'Blood Knight',
		'Berserk',
		'Toxin Rogue',
		'Shadow Monk',
		'Battle Mage'
	];

	const classDescriptions: Record<ClassName, string> = {
		'Blood Knight':
			'Durable warriors who excel in sustained combat. They have higher health and armor, allowing them to withstand more damage while still dealing significant blows to their enemies.',
		Berserk:
			'Frenzied fighters who prioritize raw damage output. They gain substantial increases in damage and attack speed with each level, and have a higher chance to land critical hits.',
		'Toxin Rogue':
			'Agile assassins specializing in poison and evasion. They are adept at dodging attacks and excel at applying poison to their weapons, increasing both poison damage and the chance to inflict it.',
		'Shadow Monk':
			'Versatile combatants balancing physical and magical abilities. They gain increased mana, slightly improved evasion, and faster attacks, with a moderate chance for critical strikes.',
		'Battle Mage':
			'Spellcasters who harness both fire and cold magic in combat. They have a large mana pool and deal significant elemental damage, with equal proficiency in both fire and cold spells.'
	};

	type AvatarFeature = {
		name: keyof CharacterAvatar;
		min: number;
		max: number;
		value: number;
	};

	function getRandomValue(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function createRandomizedAvatarFeatures(): AvatarFeature[] {
		return [
			{ name: 'beard', min: 0, max: 4, value: getRandomValue(0, 4) },
			{ name: 'eyes', min: 0, max: 5, value: getRandomValue(0, 5) },
			{ name: 'hair', min: 0, max: 4, value: getRandomValue(0, 4) },
			{ name: 'head', min: 0, max: 5, value: getRandomValue(0, 5) },
			{ name: 'mouth', min: 0, max: 5, value: getRandomValue(0, 5) },
			{ name: 'nose', min: 0, max: 5, value: getRandomValue(0, 5) }
		];
	}

	let avatarFeatures = createRandomizedAvatarFeatures();

	$: avatar = avatarFeatures.reduce((acc, feature) => {
		acc[feature.name] = feature.value;
		return acc;
	}, {} as CharacterAvatar);

	function featurePrev(index: number) {
		const feature = avatarFeatures[index];
		feature.value = feature.value > feature.min ? feature.value - 1 : feature.max;
		avatarFeatures = [...avatarFeatures];
	}

	function featureNext(index: number) {
		const feature = avatarFeatures[index];
		feature.value = feature.value < feature.max ? feature.value + 1 : feature.min;
		avatarFeatures = [...avatarFeatures];
	}

	function randomizeAvatar() {
		avatarFeatures = createRandomizedAvatarFeatures();
	}

	async function confirmCharacter() {
		await addCharacter({
			name: characterName,
			class: characterClass,
			avatar
		});
		goto('/account');
	}

	function cancel() {
		goto('/account');
	}
</script>

<HeaderLoggedIn />

<main>
	<div class="character-creator">
		<h2>Create Your Character</h2>

		<div class="character-form">
			<div class="features">
				<div class="avatar-preview">
					<AvatarComponent {avatar} />
				</div>
				{#each avatarFeatures as feature, index}
					<div class="changer">
						<button on:click={() => featurePrev(index)}>[-]</button>
						<span>
							{feature.name.charAt(0).toUpperCase() + feature.name.slice(1)} ({feature.value}/{feature.max})
						</span>
						<button on:click={() => featureNext(index)}>[+]</button>
					</div>
				{/each}
				<button class="randomize" on:click={randomizeAvatar}>[Randomize]</button>
			</div>
			<div class="details">
				<div class="form-group">
					<label for="name-input">Name:</label>
					<input type="text" name="vd-name" id="name-input" bind:value={characterName} />
				</div>
				<div class="form-group">
					<label for="class-select">Class:</label>
					<select name="vd-class" id="class-select" bind:value={characterClass} required>
						<option value="" disabled hidden>Select a class</option>
						{#each classOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
					{#if characterClass}
						<div
							class="char-preview s-char-{characterClass.replaceAll(' ', '-').toLocaleLowerCase()}"
						></div>
						<div class="class-description">
							<p>{classDescriptions[characterClass]}</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="actions">
			<button class="cancel" on:click={cancel}>[Cancel]</button>
			<button class="confirm" on:click={confirmCharacter}>[Confirm character]</button>
		</div>
	</div>
</main>

<style lang="scss">
	.char-preview {
		width: 96px;
		height: 96px;
		background-size: 100%;
		image-rendering: pixelated;
		margin-left: auto;
		margin-right: auto;
	}

	.s-char-blood-knight {
		background-image: url('$lib/assets/char/classes/blood-knight.gif');
	}

	.s-char-berserk {
		background-image: url('$lib/assets/char/classes/berserk.gif');
	}

	.s-char-battle-mage {
		background-image: url('$lib/assets/char/classes/mage.gif');
	}

	.s-char-shadow-monk {
		background-image: url('$lib/assets/char/classes/monk.gif');
	}

	.s-char-toxin-rogue {
		background-image: url('$lib/assets/char/classes/rogue.gif');
	}

	main {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		animation: fade-in-page 1s ease;
	}

	.character-creator {
		background-color: var(--background);
		border: 1px solid var(--secondary);
		padding: 20px;
	}

	h2 {
		text-align: center;
		margin-bottom: 2rem;
		margin-top: 0;
		color: var(--primary);
	}

	.randomize {
		margin-top: 1rem;
		width: 100%;
	}

	.avatar-preview {
		position: relative;
		width: 150px;
		height: 150px;
		margin: 0 auto 1rem;
	}

	.character-form {
		display: flex;
		gap: 4rem;
	}

	.details {
		width: 250px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		text-align: center;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: bold;
		color: var(--secondary);
	}

	input,
	select {
		width: 100%;
		padding: 5px;
		background-color: var(--background);
		color: var(--primary);
		border: 1px solid var(--secondary);
		font-family: var(--font-mono);
		outline: none;
		box-shadow: none;
		font-size: 14px;
	}

	.changer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--secondary);
	}

	.class-description {
		font-size: 12px;
		color: var(--secondary);
	}

	button {
		background: none;
		outline: none;
		box-shadow: none;
		padding: 5px 10px;
		margin: 0;
		color: var(--secondary);
		font-family: var(--font-mono);
		cursor: pointer;

		&:hover {
			background-color: var(--secondary);
			color: var(--background);
		}

		&:active {
			opacity: 0.8;
			scale: 0.95;
		}
	}

	.actions {
		display: flex;
		justify-content: space-between;
		margin-top: 2rem;

		.cancel {
			color: var(--hp);

			&:hover {
				background-color: var(--hp);
				color: var(--background);
			}
		}

		.confirm {
			color: var(--poison);

			&:hover {
				background-color: var(--poison);
				color: var(--background);
			}
		}
	}
</style>
