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
	let characterClass: string;

	let ranges = {
		beard: [0, 4],
		eyes: [0, 5],
		hair: [0, 4],
		head: [0, 5],
		mouth: [0, 5],
		nose: [0, 5]
	};

	let avatar: CharacterAvatar = {
		beard: 1,
		eyes: 1,
		hair: 1,
		head: 1,
		mouth: 1,
		nose: 1
	};

	function featurePrev(feature: keyof CharacterAvatar) {
		if (ranges[feature][0] < avatar[feature]) avatar[feature]--;
	}

	function featureNext(feature: keyof CharacterAvatar) {
		if (ranges[feature][1] > avatar[feature]) avatar[feature]++;
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
	<div class="avatar-preview">
		<AvatarComponent {avatar} />
	</div>
	<div>
		<label for="name-input">Name:</label><br />
		<input type="text" name="vd-name" id="name-input" bind:value={characterName} /><br />
		<label for="class-input">Class:</label><br />
		<input type="text" name="vd-class" id="class-input" bind:value={characterClass} /><br />
		<div class="changer">
			<button
				on:click={() => {
					featurePrev('beard');
				}}>[-]</button
			>
			<span>Beard ({avatar.beard}/{ranges.beard[1]})</span>
			<button
				on:click={() => {
					featureNext('beard');
				}}>[+]</button
			>
		</div>
		<div class="changer">
			<button
				on:click={() => {
					featurePrev('eyes');
				}}>[-]</button
			>
			<span>Eyes ({avatar.eyes}/{ranges.eyes[1]})</span>
			<button
				on:click={() => {
					featureNext('eyes');
				}}>[+]</button
			>
		</div>
		<div class="changer">
			<button
				on:click={() => {
					featurePrev('hair');
				}}>[-]</button
			>
			<span>Hair ({avatar.hair}/{ranges.hair[1]})</span>
			<button
				on:click={() => {
					featureNext('hair');
				}}>[+]</button
			>
		</div>
		<div class="changer">
			<button
				on:click={() => {
					featurePrev('head');
				}}>[-]</button
			>
			<span>Head ({avatar.head}/{ranges.head[1]})</span>
			<button
				on:click={() => {
					featureNext('head');
				}}>[+]</button
			>
		</div>
		<div class="changer">
			<button
				on:click={() => {
					featurePrev('mouth');
				}}>[-]</button
			>
			<span>Mouth ({avatar.mouth}/{ranges.mouth[1]})</span>
			<button
				on:click={() => {
					featureNext('mouth');
				}}>[+]</button
			>
		</div>
		<div class="changer">
			<button
				on:click={() => {
					featurePrev('nose');
				}}>[-]</button
			>
			<span>Nose ({avatar.nose}/{ranges.nose[1]})</span>
			<button
				on:click={() => {
					featureNext('nose');
				}}>[+]</button
			>
		</div>
	</div>

	<div class="actions">
		<button on:click={cancel}>[Cancel]</button>
		<button class="confirm" on:click={confirmCharacter}>[Confirm character]</button>
	</div>
</main>

<style lang="scss">
	main {
		margin-top: 60px;
	}

	.avatar-preview {
		position: relative;
		width: 150px;
		height: 150px;
	}

	.changer {
		display: flex;
	}

	input {
		margin-bottom: 15px;
	}

	.actions {
		margin-top: 30px;

		.confirm {
			color: var(--poison);
		}
	}
</style>
