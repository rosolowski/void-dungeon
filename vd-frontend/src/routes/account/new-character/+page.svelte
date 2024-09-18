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
			'Corrupted warriors who fuel their abilities with life essence. They sacrifice their own vitality to unleash devastating attacks and can create blood pools to sustain themselves and their allies.',
		Berserk:
			'Frenzied fighters consumed by battle rage. As they take and deal damage, their power grows, allowing them to unleash increasingly destructive attacks at the cost of self-control.',
		'Toxin Rogue':
			'Agile assassins who specialize in lethal poisons. They coat their blades with various toxins, inflicting debilitating effects on their enemies while dancing through the shadows.',
		'Shadow Monk':
			'Ascetics who have mastered the art of shadow manipulation. They blend martial arts with dark energy, striking from unexpected angles and phasing through reality.',
		'Battle Mage':
			'Hardened spellcasters who have fused arcane knowledge with combat expertise. They enchant their weapons with destructive magic, seamlessly weaving spells and sword strikes.'
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
