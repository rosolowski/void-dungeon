<script lang="ts">
	import GameLoader from './GameLoader.svelte';
	import GameMenu from './GameMenu.svelte';
	import GameViewport from './GameViewport.svelte';
	import WindowManager from '$lib/components/game/WindowManager.svelte';
	import { player } from '$lib/store/player';
	import { location } from '$lib/store/location';
	import { initializeServerConnection } from '$lib/api/services/game.service';
	import { onMount } from 'svelte';
	import { characterId, jwt, user } from '$lib/store/auth';
	import { goto } from '$app/navigation';
	import ItemDragged from '$lib/components/game/ItemDragged.svelte';

	onMount(async () => {
		if (!$jwt || !$user || !$characterId) {
			goto('/login');
			return;
		}
		initializeServerConnection();
	});

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
