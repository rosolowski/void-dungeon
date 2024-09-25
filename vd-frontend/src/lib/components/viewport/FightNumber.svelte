<script lang="ts">
	import { renderer } from '$lib/store/renderer';
	import type { FightNumber } from '$lib/store/viewport-effects';

	export let fightNumber: FightNumber;

	const randomOffsetX = Math.random() * 50;
	const randomOffsetY = Math.random() * 30;

	$: posX = fightNumber.x * $renderer.tileSize + $renderer.tileSize / 2 + randomOffsetX;
	$: posY = fightNumber.y * $renderer.tileSize + $renderer.tileSize / 4 + randomOffsetY;

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
		z-index: var(--zi-fight-numbers);
	}

	.damage {
		color: var(--hpLight);
	}

	.critical {
		color: #ff4500;
		text-shadow: 1px 1px 2px rgba(255, 0, 0, 0.8);
		font-size: 32px;
	}

	.dodge {
		color: #60d2ce;
	}

	.heal {
		color: #51e451;
	}

	.poison {
		color: var(--poison);
	}

	.fire {
		color: var(--fire);
	}

	.cold {
		color: var(--cold);
	}

	.light {
		color: var(--light);
	}

	.void {
		color: var(--void);
	}

	@keyframes fightNumbers {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(3);
		}
		20% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, calc(-50% - 40px));
		}
	}
</style>
