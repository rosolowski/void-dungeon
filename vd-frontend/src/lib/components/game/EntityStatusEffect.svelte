<script lang="ts">
	import type { Stats } from '$lib/class/Stats';
	import Tooltip from '../tooltips/Tooltip.svelte';

	export let stats: Stats;

	$: activeStatusEffects = Object.entries(stats)
		.filter(
			([key, value]) =>
				['poisonStatus', 'fireStatus', 'coldStatus', 'lightStatus', 'voidStatus'].includes(key) &&
				value > 0
		)
		.map(([key, value]) => ({ type: key.replace('Status', ''), value }));

	function getTooltipContent(effect: { type: string; value: number }) {
		const descriptions = {
			poison: `Poison: Deals ${effect.value} damage per turn`,
			fire: `Fire: Reduces armor by ${effect.value}`,
			cold: `Cold: Reduces attack speed by ${effect.value * 0.1} (minimum 0.5 attack speed remains)`,
			light: `Light: Reduces accuracy by ${effect.value * 5}% (maximum 10% accuracy)`,
			void: `Void: Reduces armor, damage, attack speed, and crit chance by ${effect.value * 1}%`
		};

		return `
			<div class="effect-name">${effect.type.charAt(0).toUpperCase() + effect.type.slice(1)}</div>
			<div class="effect-description">${descriptions[effect.type as keyof typeof descriptions]}</div>
			<div class="effect-stacks">Stacks: ${effect.value}</div>
		`;
	}
</script>

{#if activeStatusEffects.length > 0}
	<div class="status-effects">
		{#each activeStatusEffects as effect}
			<Tooltip content={getTooltipContent(effect)} borderClass={effect.type}>
				<div class="status-effect {effect.type}">
					<span class="effect-value">{effect.value}</span>
				</div>
			</Tooltip>
		{/each}
	</div>
{/if}

<style lang="scss">
	.status-effects {
		display: flex;
		gap: 5px;
		height: 20px;
	}

	.status-effect {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-weight: bold;
		background-color: var(--background);
		color: var(--primary);
		cursor: pointer;
		pointer-events: all;

		&.poison {
			border: 2px solid var(--poison);
		}
		&.fire {
			border: 2px solid var(--fire);
		}
		&.cold {
			border: 2px solid var(--cold);
		}
		&.light {
			border: 2px solid var(--light);
		}
		&.void {
			border: 2px solid var(--void);
		}
	}

	:global(.effect-name) {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 5px;
	}

	:global(.effect-description) {
		font-size: 14px;
		margin-bottom: 5px;
	}

	:global(.effect-stacks) {
		font-size: 14px;
		font-weight: bold;
	}
</style>
