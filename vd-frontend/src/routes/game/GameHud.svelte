<script lang="ts">
	import { player } from '$lib/store/player';
	import { device } from '$lib/store/device';
	import { windows } from '$lib/store/windows';
	import CharacterWindow from '$lib/components/windows/CharacterWindow.svelte';
	import AvatarComponent from '$lib/components/shared/AvatarComponent.svelte';
	import EntityStatusEffect from '$lib/components/game/EntityStatusEffect.svelte';
	import SkillBar from '$lib/components/game/SkillBar.svelte';

	function openCharacterWindow() {
		windows.openWindow({
			id: 'characterWindow',
			title: 'Character',
			component: CharacterWindow,
			props: {}
		});
	}

	$: avatar = $player!.avatar;
</script>

{#if $player}
	<div class="game-hud" class:mobile={$device.isMobile}>
		<div class="avatar interactive" on:click={openCharacterWindow}>
			<AvatarComponent {avatar} />
			<div class="overlay"></div>
		</div>
		<div class="status-container">
			<div class="title">{$player?.name || 'unknown'} | lvl {$player?.level || '1'}</div>
			<div class="bars">
				<div class="exp bar">
					<div
						class="fill"
						style:width={(($player?.exp || 0) / ($player?.maxExp || 1)) * 100 + '%'}
					></div>
				</div>
				<div class="hp bar">
					<div
						class="fill"
						style:width={(($player?.stats.hp || 1) / ($player?.stats.maxHp || 1)) * 100 + '%'}
					></div>
				</div>
				<div class="mana bar">
					<div
						class="fill"
						style:width={(($player?.stats.mana || 0) / ($player?.stats.maxMana || 1)) * 100 + '%'}
					></div>
				</div>
			</div>
			<SkillBar />
			<EntityStatusEffect stats={$player.stats} />
		</div>
		<div class="currency-container"></div>
	</div>
{/if}

<style lang="scss">
	.game-hud {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		display: flex;
		gap: 20px;
		padding: 20px 10px;
		z-index: var(--zi-game-hud);
	}

	.status-container {
		display: flex;
		flex-direction: column;
		gap: 15px;
		height: min-content;

		.title {
			text-shadow:
				0 0 4px var(--background),
				0 0 4px var(--background);
		}

		.bar {
			height: 10px;
			width: 235px;
			border-bottom: 1px solid var(--secondary);
			background-color: var(--background);

			.fill {
				height: 100%;
				animation: bar 8s infinite ease;
			}
		}

		.mana .fill {
			background-color: var(--mana);
		}
		.hp .fill {
			background-color: var(--hp);
		}
		.exp .fill {
			background-color: var(--exp);
		}
	}

	.avatar {
		position: relative;
		border: 1px solid var(--secondary);
		border-radius: 64px;
		background-color: var(--background);
		width: 110px;
		height: 110px;
		user-select: none;

		.overlay {
			position: absolute;
			width: 100%;
			height: 100%;
			border-radius: 64px;
			top: 0;
			left: 0;
			box-shadow:
				0 0 4px var(--secondary),
				inset 0 0 32px -16px var(--secondary);
			animation: avatar 8s infinite ease;
		}

		&:hover {
			cursor: pointer;
			box-shadow:
				0 0 4px var(--secondary),
				inset 0 0 32px -16px var(--secondary);
		}
	}

	// mobile styles
	.game-hud.mobile {
		.avatar {
			width: 60px;
			height: 60px;
		}

		.status-container {
			gap: 10px;

			.bar {
				height: 10px;
				width: 165px;
				max-width: 40vw;
			}
		}
	}

	@keyframes avatar {
		0% {
			box-shadow:
				0 0 4px var(--secondary),
				inset -8px 8px 48px -16px var(--secondary);
		}
		25% {
			box-shadow:
				0 0 4px var(--secondary),
				inset 4px 4px 32px -16px var(--secondary);
		}
		50% {
			box-shadow:
				0 0 2px var(--secondary),
				inset 8px -8px 48px -16px var(--secondary);
		}
		75% {
			box-shadow:
				0 0 4px var(--secondary),
				inset 4px -4px 32px -16px var(--secondary);
		}
		100% {
			box-shadow:
				0 0 4px var(--secondary),
				inset -8px 8px 48px -16px var(--secondary);
		}
	}

	@keyframes bar {
		0% {
			box-shadow: inset -2px 2px 8px -4px var(--secondary);
		}
		25% {
			box-shadow: inset 1px 1px 5px -4px var(--secondary);
		}
		50% {
			box-shadow: inset 2px -2px 8px -4px var(--secondary);
		}
		75% {
			box-shadow: inset 1px -1px 5px -4px var(--secondary);
		}
		100% {
			box-shadow: inset -2px 2px 8px -4px var(--secondary);
		}
	}
</style>
