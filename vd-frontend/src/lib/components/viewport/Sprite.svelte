<script lang="ts">
	export let spriteId: string;
</script>

<div class="sprite s-{spriteId}"></div>

<style>
	.sprite {
		width: 100%;
		height: 100%;
		background-size: 100%;
		image-rendering: pixelated;
	}

	.s-warrior {
		background-image: url('$lib/assets/char/warrior/idle.gif');
	}

	.s-monster1 {
		background-image: url('$lib/assets/entities/monsters/monster1.gif');
	}
</style>
