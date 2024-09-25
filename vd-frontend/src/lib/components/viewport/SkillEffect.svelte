<script lang="ts">
	import { renderer } from '$lib/store/renderer';
	import type { SkillEffect } from '$lib/store/viewport-effects';

	export let effect: SkillEffect;

	$: posX = effect.x * $renderer.tileSize;
	$: posY = effect.y * $renderer.tileSize;
	$: animationType = effect.id;
</script>

<div
	class="skill-effect animation-{animationType}"
	style:left={`${posX}px`}
	style:top={`${posY}px`}
	style:width={`${$renderer.tileSize}px`}
	style:height={`${$renderer.tileSize}px`}
>
	<div class="main-circle" />
	<div class="particle-container">
		<div class="particle p1" />
		<div class="particle p2" />
		<div class="particle p3" />
	</div>
</div>

<style lang="scss">
	.skill-effect {
		position: absolute;
		will-change: opacity, transform;
		border-radius: 50%;
		overflow: visible;
		animation: fade-in-out 1s ease forwards;
	}

	.main-circle {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.particle-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.particle {
		position: absolute;
		width: 20%;
		height: 20%;
		border-radius: 50%;
		opacity: 0;
	}

	.p1 {
		left: 40%;
		bottom: 20%;
		opacity: 0.5;
	}
	.p2 {
		left: 20%;
		bottom: 60%;
		opacity: 0.5;
	}
	.p3 {
		right: 20%;
		top: 30%;
		opacity: 0.5;
	}

	// Skill-specific animations
	.animation-fireball {
		.main-circle {
			background: radial-gradient(var(--fire), rgb(243, 130, 10), var(--fire));
			animation: expand-contract 1s ease-in-out infinite;
		}
		.particle {
			animation: particle-burst 1s ease-out infinite;
		}
		.p1 {
			background-color: rgb(243, 99, 10);
			--tx: -50%;
			--ty: -50%;
		}
		.p2 {
			background-color: rgb(243, 76, 10);
			--tx: 50%;
			--ty: -50%;
		}
		.p3 {
			background-color: rgb(243, 169, 10);
			--tx: 0;
			--ty: 50%;
		}
	}

	.animation-frostfire_bolt {
		.main-circle {
			background: linear-gradient(to right, var(--fire), transparent, var(--cold));
			animation: rotate 1s linear infinite;
		}
		.particle {
			animation: particle-spiral 1s ease-out infinite;
		}
		.p1 {
			background-color: var(--fire);
		}
		.p2 {
			background-color: var(--cold);
		}
		.p3 {
			background-color: var(--fire);
		}
	}

	.animation-lightning_strike {
		.main-circle {
			background-color: var(--light);
			animation: expand-flash 0.5s ease-in-out infinite;
		}
		.particle {
			background-color: var(--primary);
			width: 100%;
			height: 2px;
			rotate: 45deg;
			left: -50%;
			animation: lightning-bolt 0.5s ease-out infinite;
		}
		.p1 {
			transform: rotate(0deg);
			top: 0;
			left: -50%;
		}
		.p2 {
			transform: rotate(45deg);
			top: 0;
			left: -50%;
		}
		.p3 {
			transform: rotate(-45deg);
			top: 0;
			left: -50%;
		}
	}

	.animation-soul_drain {
		.main-circle {
			background-color: var(--void);
			animation: pulse 1s ease-in-out infinite;
		}
		.particle {
			border: 2px solid var(--rarityEpic);
			animation: particle-spiral 1s linear infinite reverse;
		}
	}

	.animation-heal,
	.animation-heal_2,
	.animation-heal_3 {
		.main-circle {
			background-color: var(--poison);
			opacity: 0.5;
			animation: expand-contract 1s ease-in-out infinite;
		}
		.particle {
			background-color: var(--rarityUncommon);
			animation: particle-rise 1s ease-out infinite;
		}
		.p1 {
			left: 40%;
			bottom: 20%;
		}
		.p2 {
			left: 20%;
			bottom: 30%;
		}
		.p3 {
			right: 20%;
			top: 30%;
		}
	}

	.animation-status_reduction {
		.main-circle {
			background-color: var(--tetriary);
			animation: shrink 1s ease-out;
		}
		.particle {
			border: 2px dashed var(--secondary);
			animation: rotate 1s linear infinite;
		}
	}

	.animation-poison_curation {
		.main-circle {
			background-color: var(--poison);
			animation: pulse 1s ease-in-out infinite;
		}
		.particle {
			background-color: var(--rarityUncommon);
			animation: particle-fall 1s ease-out infinite;
		}
	}

	.animation-elemental_absorption {
		.main-circle {
			background: conic-gradient(transparent, var(--cold), transparent, var(--void), transparent);
			animation: expand-flash 1s linear infinite;
		}
		.particle {
			animation: particle-absorb 1s ease-out infinite;
		}
		.p1 {
			background-color: var(--fire);
			--startX: -50%;
			--startY: -50%;
			--endX: 0%;
			--endY: 0%;
			left: -50%;
			top: -50%;
		}
		.p2 {
			background-color: var(--cold);
			--startX: 50%;
			--startY: -50%;
			--endX: 0%;
			--endY: 0%;
			right: -50%;
			top: -50%;
		}
		.p3 {
			background-color: var(--light);
			--startX: 100%;
			--startY: 50%;
			--endX: 0%;
			--endY: 0%;
			bottom: -50%;
			left: 50%;
			transform: translateX(-50%);
		}
	}

	.animation-blood_ritual {
		.main-circle {
			background-color: var(--hp);
			animation: pulse 1s ease-in-out infinite;
		}
		.particle {
			background-color: var(--hpLight);
			animation: particle-burst 1s ease-out infinite;
		}
	}

	.animation-elemental_storm,
	.animation-elemental_maelstrom {
		.main-circle {
			background: radial-gradient(
				var(--fire),
				transparent,
				var(--light),
				transparent,
				var(--poison)
			);
			animation: expand-flash 1s linear infinite;
		}
		.particle {
			animation: particle-spiral 1s ease-out infinite;
		}
		.p1 {
			background-color: var(--fire);
		}
		.p2 {
			background-color: var(--cold);
		}
		.p3 {
			background-color: var(--light);
		}
	}

	.animation-mana_overload {
		.main-circle {
			background-color: var(--mana);
			animation: expand-flash 1s ease-out;
		}
		.particle {
			background-color: var(--manaLight);
			animation: particle-burst 1s ease-out infinite;
		}
	}

	.animation-desperation_strike {
		.main-circle {
			background-color: var(--hp);
			animation: flash-shrink 1s ease-out;
		}
		.particle {
			background-color: var(--hpLight);
			animation: particle-burst 1s ease-out infinite;
		}
	}

	.animation-elemental_cascade {
		.main-circle {
			background: conic-gradient(var(--fire), transparent, var(--light), transparent, var(--fire));
			animation:
				rotate 1s linear infinite,
				flash-shrink 1s ease-in-out infinite;
		}
		.particle {
			animation: particle-absorb 1s ease-out infinite;
		}
		.p1 {
			background-color: var(--fire);
			--startX: -50%;
			--startY: -50%;
			--endX: 0%;
			--endY: 0%;
			left: -50%;
			top: -50%;
		}
		.p2 {
			background-color: var(--cold);
			--startX: 50%;
			--startY: -50%;
			--endX: 0%;
			--endY: 0%;
			right: -50%;
			top: -50%;
		}
		.p3 {
			background-color: var(--light);
			--startX: 100%;
			--startY: 50%;
			--endX: 0%;
			--endY: 0%;
			bottom: -50%;
			left: 50%;
			transform: translateX(-50%);
		}
	}

	.animation-berserk_strike {
		.main-circle {
			background-color: var(--hp);
			animation: shake 1s ease-out;
		}
		.particle {
			background-color: var(--hpLight);
			animation: particle-burst 0.5s ease-out infinite;
		}
	}

	.animation-frenzied_strikes {
		.main-circle {
			background-color: var(--exp);
			animation: multi-strike 1s ease-out;
		}
		.particle {
			background-color: var(--expLight);
			animation: particle-burst 0.3s ease-out infinite;
		}
	}

	.animation-shadow_step {
		.main-circle {
			background-color: var(--void);
			animation: fade-in-out 1s ease-out;
		}
		.particle {
			background-color: var(--tetriary);
			animation: particle-spiral 1s linear infinite reverse;
		}
	}

	@keyframes lightning-bolt {
		0%,
		100% {
			opacity: 0;
			transform: scaleX(0.4);
		}
		50% {
			opacity: 1;
			transform: scaleX(1.5);
		}
	}

	@keyframes shrink {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(0);
			opacity: 0;
		}
	}

	@keyframes expand-flash {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		50% {
			transform: scale(1.5);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 0;
		}
	}

	@keyframes flash-shrink {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.5);
			opacity: 1;
		}
		100% {
			transform: scale(0);
			opacity: 0;
		}
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		20%,
		60% {
			transform: translateX(-5px);
		}
		40%,
		80% {
			transform: translateX(5px);
		}
	}

	@keyframes multi-strike {
		0%,
		50%,
		100% {
			transform: translateX(0) scale(1);
			opacity: 0.5;
		}
		25% {
			transform: translateX(-10px) scale(1.2);
			opacity: 1;
		}
		75% {
			transform: translateX(10px) scale(1.2);
			opacity: 1;
		}
	}

	@keyframes particle-absorb {
		0% {
			transform: translate(var(--startX), var(--startY)) scale(1);
			opacity: 1;
		}
		100% {
			transform: translate(0, 0) scale(0);
			opacity: 0;
		}
	}

	@keyframes particle-cascade {
		0% {
			transform: translate(0, -100%) scale(0.5) rotate(0deg);
			opacity: 0;
		}
		50% {
			transform: translate(0, 0) scale(1) rotate(180deg);
			opacity: 1;
		}
		100% {
			transform: translate(0, 100%) scale(0.5) rotate(360deg);
			opacity: 0;
		}
	}

	// Basic animations
	@keyframes fade-in-out {
		0%,
		100% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
	}

	@keyframes expand-contract {
		0%,
		100% {
			transform: scale(0.5);
		}
		50% {
			transform: scale(1);
		}
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.7;
		}
		50% {
			transform: scale(1.2);
			opacity: 1;
		}
	}

	// Particle animations
	@keyframes particle-rise {
		0% {
			transform: translateY(100%) scale(0.5);
			opacity: 0;
		}
		50% {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
		100% {
			transform: translateY(-100%) scale(0.5);
			opacity: 0;
		}
	}

	@keyframes particle-fall {
		0% {
			transform: translateY(-100%) scale(0.5);
			opacity: 0;
		}
		50% {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
		100% {
			transform: translateY(100%) scale(0.5);
			opacity: 0;
		}
	}

	@keyframes particle-spiral {
		0% {
			transform: rotate(0deg) translateY(0) scale(0.5);
			opacity: 0;
		}
		50% {
			transform: rotate(180deg) translateY(-50%) scale(1);
			opacity: 1;
		}
		100% {
			transform: rotate(360deg) translateY(-100%) scale(0.5);
			opacity: 0;
		}
	}

	@keyframes particle-burst {
		0% {
			transform: scale(0.5) translateX(0) translateY(0);
			opacity: 0;
		}
		50% {
			transform: scale(1) translateX(var(--tx)) translateY(var(--ty));
			opacity: 1;
		}
		100% {
			transform: scale(0.5) translateX(calc(var(--tx) * 2)) translateY(calc(var(--ty) * 2));
			opacity: 0;
		}
	}
</style>
