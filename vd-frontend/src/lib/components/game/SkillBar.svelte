<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import SkillTooltip from '$lib/components/tooltips/SkillTooltip.svelte';
	import { skillManager } from '$lib/store/skill-manager';
	import { useSkill } from '$lib/api/services/game.service';
	import type { Skill } from '$lib/class/Skill';
	import { player } from '$lib/store/player';
	import { entityTracker } from '$lib/store/entity-tracker';
	import Tooltip from '$lib/components/tooltips/Tooltip.svelte';

	let skillElements: HTMLElement[] = [];

	$: skills = $skillManager.concat(Array(5 - $skillManager.length).fill(null)).slice(0, 5);

	function handleSkillClick(skill: Skill) {
		useSkillIfPossible(skill);
	}

	function useSkillIfPossible(skill: Skill, index?: number) {
		if (skill.targetType === 'passive') {
			return;
		}
		if (skill.targetType === 'self' && canUseSkill(skill)) {
			useSkill(skill.id);
			animateSkillUse(index);
		}
		if (
			skill.targetType === 'enemy' &&
			$entityTracker?.id !== undefined &&
			$entityTracker?.id !== null &&
			canUseSkill(skill)
		) {
			useSkill(skill.id, $entityTracker.id);
			animateSkillUse(index);
		}
	}

	function animateSkillUse(index?: number) {
		if (index !== undefined && skillElements[index]) {
			skillElements[index].style.transform = 'scale(0.9)';
			setTimeout(() => {
				if (skillElements[index]) {
					skillElements[index].style.transform = 'scale(1)';
				}
			}, 100);
		}
	}

	function getSkillRarityClass(skill: Skill | null): string {
		if (!skill) return '';
		return skill.rarity.toLowerCase();
	}

	function isPassiveSkill(skill: Skill | null): boolean {
		return skill?.targetType === 'passive';
	}

	function canUseSkill(skill: Skill): boolean {
		return $player!.stats.mana >= skill.manaCost && $player!.level >= skill.minLevel;
	}

	function getSkillCooldownPercentage(skill: Skill): number {
		return 0;
	}

	function handleKeyPress(event: KeyboardEvent) {
		const keyNumber = parseInt(event.key);
		if (keyNumber >= 1 && keyNumber <= 5) {
			const skill = skills[keyNumber - 1];
			if (skill && !isPassiveSkill(skill) && canUseSkill(skill)) {
				useSkillIfPossible(skill, keyNumber - 1);
			}
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeyPress);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyPress);
	});

	const emptySlotTooltip =
		'You get a random skill each floor. You can manage skills in the skill window.';
</script>

<div class="skills interactive">
	{#each skills as skill, index}
		{#if skill}
			<SkillTooltip {skill}>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div
					class="skill {getSkillRarityClass(skill)}"
					class:passive={isPassiveSkill(skill)}
					class:disabled={!canUseSkill(skill)}
					on:click={() => handleSkillClick(skill)}
					bind:this={skillElements[index]}
				>
					{skill.name
						.split(' ')
						.map((word) => word.charAt(0))
						.join('')}

					{#if !isPassiveSkill(skill)}
						<div
							class="cooldown-overlay"
							style="height: {getSkillCooldownPercentage(skill)}%"
						></div>
						<span class="keybind">{index + 1}</span>
					{/if}
					{#if skill.manaCost > 0}
						<span class="mana-cost">{skill.manaCost}</span>
					{/if}
				</div>
			</SkillTooltip>
		{:else}
			<Tooltip content={emptySlotTooltip}>
				<div class="skill empty">
					<span class="keybind">{index + 1}</span>
				</div>
			</Tooltip>
		{/if}
	{/each}
</div>

<style lang="scss">
	.skills {
		display: flex;
		gap: 15px;

		.skill {
			width: 35px;
			height: 35px;
			border: 1px solid var(--secondary);
			background-color: var(--background);
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
			position: relative;
			transition: transform 0.1s ease;

			&.common {
				border-color: var(--rarityCommon);
			}
			&.uncommon {
				border-color: var(--rarityUncommon);
			}
			&.rare {
				border-color: var(--rarityRare);
			}
			&.epic {
				border-color: var(--rarityEpic);
			}
			&.legendary {
				border-color: var(--rarityLegendary);
			}

			&.passive {
				border-radius: 50%;
			}

			&.disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}

			&.empty {
				border-style: dashed;
				opacity: 0.3;
			}

			.cooldown-overlay {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				background-color: rgba(0, 0, 0, 0.5);
			}

			.mana-cost {
				position: absolute;
				bottom: 2px;
				right: 2px;
				font-size: 10px;
				color: var(--manaLight);
			}

			.keybind {
				position: absolute;
				bottom: -15px;
				left: 50%;
				transform: translateX(-50%);
				font-size: 10px;
				color: var(--secondary);
			}
		}
	}
</style>
