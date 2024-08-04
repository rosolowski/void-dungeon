<script lang="ts">
	import { renderer } from '$lib/store/renderer';
	import type { FightNumber } from '$lib/store/viewport-effects';

	export let fightNumber: FightNumber;

	$: posX = fightNumber.x * $renderer.tileSize;
	$: posY = fightNumber.y * $renderer.tileSize;

	$: value = fightNumber.type === 'DODGE' ? 'Dodge!' : Math.abs(fightNumber.value);
</script>

<div
	class="fight-number {fightNumber.type.toLowerCase()}"
	style:left={`${posX}px`}
	style:top={`${posY}px`}
>
	{value}
</div>

<style lang="scss">
	.fight-number {
		position: absolute;
		font-size: 24px;
		animation: fightNumbers 1s ease forwards;
		font-weight: bold;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
	}

	.damage {
		color: var(--hpLight);
	}

	.critical {
		color: #ff4500;
		font-size: 32px;
	}

	.dodge {
		color: #60d2ce;
	}

	.heal {
		color: #00ff00;
	}

	.poison {
		color: #8b008b;
	}

	.fire {
		color: #ff4500;
	}

	.cold {
		color: #1e90ff;
	}

	.light {
		color: #ffd700;
	}

	.void {
		color: #800080;
	}

	@keyframes fightNumbers {
		0% {
			opacity: 1;
			transform: translateY(0) scale(2);
		}
		20% {
			opacity: 1;
			transform: translateY(-5px) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateY(-40px);
		}
	}
</style>
