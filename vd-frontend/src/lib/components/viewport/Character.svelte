<script lang="ts">
	import type { Character } from '$lib/class/Character';
	import { renderer } from '$lib/store/renderer';
	import CharacterSprite from './CharacterSprite.svelte';

	export let character: Character;

	$: posX = character.pos.x * $renderer.tileSize;
	$: posY = character.pos.y * $renderer.tileSize;
</script>

<div
	class="character characterid-{character.id}"
	style:left={`${posX}px`}
	style:top={`${posY}px`}
	style:width={`${$renderer.tileSize}px`}
	style:height={`${$renderer.tileSize}px`}
>
	<CharacterSprite />
</div>

<style lang="scss">
	.character {
		position: absolute;
		background-color: rgba(0, 11, 128, 0.25);
		transition:
			top var(--primaryEasingFunction) var(--primarySpeed),
			left var(--primaryEasingFunction) var(--primarySpeed),
			width var(--primaryEasingFunction) var(--primarySpeed),
			height var(--primaryEasingFunction) var(--primarySpeed);
	}
</style>
