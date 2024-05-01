<script lang="ts">
	import GameLoader from './GameLoader.svelte';
	import GameMenu from './GameMenu.svelte';
	import GameViewport from './GameViewport.svelte';
	import WindowManager from '$lib/components/game/WindowManager.svelte';
	import { player } from '$lib/store/player';
	import { location } from '$lib/store/location';
	import { fetchPlayer, initializeServerConnection } from '$lib/api/services/game.service';
	import { onMount } from 'svelte';
	import { characterId, jwt, user } from '$lib/store/auth';
	import { goto } from '$app/navigation';
	import ItemDragged from '$lib/components/game/ItemDragged.svelte';
	import { MapGenerator } from '$lib/class/MapGenerator';

	onMount(async () => {
		if (!$jwt || !$user || !$characterId) {
			goto('/login');
			return;
		}
		initializeServerConnection();
	});

	//  map generator testing
	// const mapGenerator = new MapGenerator(140, 120);
	// mapGenerator.generateTerrain();

	$: isLoading = $player == null || $location == null || $characterId == null;
</script>

<GameLoader hide={!isLoading} />
<ItemDragged />
<WindowManager />
<div class="game-container">
	<GameViewport />
	<GameMenu />
</div>

<style lang="scss">
	.game-container {
		height: 100vh;
		width: 100vw;
		display: flex;
		overflow-x: hidden;
		overflow-y: hidden;
	}
</style>
