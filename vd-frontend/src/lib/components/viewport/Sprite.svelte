<script lang="ts">
	export let spriteId: string;
</script>

<div class="sprite s-{spriteId.replaceAll(' ', '-').toLocaleLowerCase()}"></div>

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

	.s-goblin {
		background-image: url('$lib/assets/entities/monsters/monster1.gif');
	}

	.s-snake {
		background-image: url('$lib/assets/entities/monsters/snake.gif');
	}

	.s-vampire {
		background-image: url('$lib/assets/entities/monsters/vampire.gif');
	}

	.s-the-merchant {
		background-image: url('$lib/assets/entities/npc/merchant.gif');
	}
</style>
