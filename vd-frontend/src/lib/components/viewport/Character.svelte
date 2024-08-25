<script lang="ts">
	import type { Character } from '$lib/class/Character';
	import { renderer } from '$lib/store/renderer';
	import CharacterTooltip from '../tooltips/CharacterTooltip.svelte';
	import CharacterSprite from './CharacterSprite.svelte';
	import { contextMenu } from '$lib/store/context-menu';
	import { inviteToParty } from '$lib/api/services/game.service';

	export let character: Character;

	$: posX = character.pos.x * $renderer.tileSize;
	$: posY = character.pos.y * $renderer.tileSize;

	function onContextMenu(event: MouseEvent) {
		event.preventDefault();
		const options = [
			{
				label: 'Profile',
				action: () => {
					console.log('Viewing profile of:', character.name);
				}
			},
			{
				label: 'Invite to Party',
				action: () => {
					inviteToParty(character.id);
					console.log('Inviting to party:', character.name);
				}
			}
		];

		// if (character.isInParty) {
		// 	options.push({
		// 		label: 'Remove from Party',
		// 		action: () => {
		// 			console.log('Removing from party:', character.name);
		// 		}
		// 	});
		// }

		contextMenu.open(event.clientX, event.clientY, options);
	}
</script>

<CharacterTooltip {character}>
	<div
		class="character characterid-{character.id}"
		style:left={`${posX}px`}
		style:top={`${posY}px`}
		style:width={`${$renderer.tileSize}px`}
		style:height={`${$renderer.tileSize}px`}
		on:contextmenu={onContextMenu}
	>
		<CharacterSprite />
	</div>
</CharacterTooltip>

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
