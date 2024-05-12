<script lang="ts">
	import { renderer } from '$lib/store/renderer';
	import type { FightNumber } from '$lib/store/viewport-effects';

	export let fightNumber: FightNumber;

	$: posX = fightNumber.x * $renderer.tileSize;
	$: posY = fightNumber.y * $renderer.tileSize;
</script>

<div
	class="fight-number {fightNumber.type}"
	style:left={`${posX}px`}
	style:top={`${posY}px`}
>
	{fightNumber.value}
</div>

<style lang="scss">
	.fight-number {
		position: absolute;
    font-size: 32px;
    animation: fightNumbers 1s ease forwards;
    
    &.DAMAGE {
      color: var(--hp);
    }
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
