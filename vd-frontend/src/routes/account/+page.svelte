<script lang="ts">
	import { goto } from '$app/navigation';
	import HeaderLoggedIn from '$lib/components/home/HeaderLoggedIn.svelte';
	import CharactersList from './CharactersList.svelte';
	import { onMount } from 'svelte';
	import { jwt, user } from '$lib/store/auth';
	import { getCharacters } from '$lib/api/services/character-manager.service';
	import { logOut } from '$lib/api/services/auth.service';

	onMount(() => {
		if (!$jwt || !$user) {
			goto('/login');
		}
	});

	let promise = fetchCharacters();

	async function fetchCharacters() {
		try {
			return await getCharacters();
		} catch (e) {
			logOut();
			goto('/');
		}
	}

	function createNewCharacterNav() {
		goto('/account/new-character');
	}

	function charactersUpdatedHandler() {
		promise = fetchCharacters();
	}
</script>

<HeaderLoggedIn />

<main>
	<h2>Characters</h2>
	{#await promise}
		<p>...Loading characters</p>
	{:then characters}
		<CharactersList {characters} on:charactersUpdated={charactersUpdatedHandler} />
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}

	<button on:click={createNewCharacterNav}>[Create new character]</button>
</main>

<style>
	main {
		margin-top: 60px;
	}

	button {
		margin-top: 30px;
	}
</style>
