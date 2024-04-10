<script lang="ts">
	import logo from '$lib/assets/vd-brand-nobg.png';

	export let hide: boolean;
</script>

<div class="vd-loading-container" class:hide>
	<img class="vd-loading" src={logo} width="256px" height="256px" alt="Void Dungeon" />
	Loading
</div>

<style lang="scss">
	.vd-loading-container {
		display: flex;
		position: absolute;
		top: 0;
		left: 0;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		font-size: 16px;
		color: var(--secondary);
		background-color: var(--background);
		user-select: none;
		-webkit-user-drag: none;
		opacity: 1;
		z-index: var(--zi-game-loader);
		transition: none;
		pointer-events: all;

		&.hide {
			opacity: 0;
			pointer-events: none;
			transition: opacity 0.5s;
		}
	}

	.vd-loading {
		image-rendering: pixelated;
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}
</style>
