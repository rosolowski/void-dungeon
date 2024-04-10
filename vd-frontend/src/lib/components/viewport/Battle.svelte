<script>
	import CharacterSprite from './CharacterSprite.svelte';
	import EntitySprite from './EntitySprite.svelte';
	import PlayerSprite from './PlayerSprite.svelte';
</script>

<div class="battle">
	<div class="board">
		<div class="left column">
			<div class="slot">
				<PlayerSprite />
			</div>
			<div class="slot">
				<CharacterSprite />
			</div>
			<div class="slot">
				<CharacterSprite />
			</div>
			<div class="slot"></div>
		</div>
		<div class="right column">
			<div class="slot"></div>
			<div class="slot">
				<EntitySprite />
			</div>
			<div class="slot"></div>
			<div class="slot"></div>
		</div>
	</div>
</div>

<style lang="scss">
	.battle {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgb(0, 0, 37);

		.board {
			position: absolute;
			display: flex;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			gap: 200px;

			.column {
				display: flex;
				flex-direction: column;
				gap: 40px;

				.slot {
					position: relative;
					width: 64px;
					height: 64px;
					border: 1px dashed rgba(128, 128, 128, 0.443);
				}
			}
		}
	}
</style>
