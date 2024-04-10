<script lang="ts">
	import { CharacterAvatar } from '$lib/class/CharacterAvatar';
	import { headImages } from '$lib/assets/char/avatar/head-shape';
	import { beardImages } from '$lib/assets/char/avatar/beard';
	import { eyesImages } from '$lib/assets/char/avatar/eyes';
	import { hairImages } from '$lib/assets/char/avatar/hair';
	import { mouthImages } from '$lib/assets/char/avatar/mouth';
	import { noseImages } from '$lib/assets/char/avatar/nose';

	export let avatar: CharacterAvatar;
</script>

{#if avatar}
	<img class="part head" src={headImages[avatar.head]} alt="" />
	<img class="part hair" src={hairImages[avatar.hair]} alt="" />
	<img class="part eyes" src={eyesImages[avatar.eyes]} alt="" />
	<img class="part nose" src={noseImages[avatar.nose]} alt="" />
	<img class="part mouth" src={mouthImages[avatar.mouth]} alt="" />
	<img class="part beard" src={beardImages[avatar.beard]} alt="" />
	<div class="part"></div>
{/if}

<style lang="scss">
	.part {
		position: absolute;
		image-rendering: pixelated;
		width: 100%;
		height: 100%;
		top: 5px;
		left: 0;
	}
</style>
