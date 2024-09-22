<script lang="ts">
	import type { Skill, SkillRarity } from '$lib/class/Skill';
	import Tooltip from './Tooltip.svelte';

	export let skill: Skill;

	function getRarityColor(rarity: SkillRarity): string {
		const rarityColors: Record<SkillRarity, string> = {
			COMMON: 'var(--rarityCommon)',
			UNCOMMON: 'var(--rarityUncommon)',
			RARE: 'var(--rarityRare)',
			EPIC: 'var(--rarityEpic)',
			LEGENDARY: 'var(--rarityLegendary)'
		};
		return rarityColors[rarity];
	}

	function getTooltipContent(skill: Skill): string {
		const rarityColor = getRarityColor(skill.rarity);

		return `
					<div class="skill-name">${skill.name}</div>
					<div class="skill-rarity" style="color: ${rarityColor};">${skill.rarity.charAt(0).toUpperCase() + skill.rarity.toLowerCase().slice(1)}</div>
					<div class="skill-type">${skill.targetType === 'passive' ? 'PASSIVE' : `ACTIVE`}</div>
					<div class="skill-type">${skill.targetType === 'passive' ? '' : `Target: ${skill.targetType}`}</div>
					<div class="skill-description">"${skill.description}"</div>
					<div class="skill-stats">
							${skill.targetType !== 'passive' ? `<div class="stat">Mana Cost: <span style="color: var(--manaLight);">${skill.manaCost}</span></div>` : ''}
							<div class="stat">Required Level: ${skill.minLevel}</div>
					</div>
			`;
	}
</script>

<Tooltip content={getTooltipContent(skill)} borderClass={skill.rarity.toLowerCase()}>
	<slot />
</Tooltip>

<style lang="scss">
	:global(.skill-name) {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 5px;
		font-family: var(--font-mono);
		color: var(--primary);
	}

	:global(.skill-rarity) {
		font-size: 14px;
		font-weight: bold;
		margin-bottom: 5px;
		font-family: var(--font-mono);
	}

	:global(.skill-type) {
		font-size: 14px;
		font-style: italic;
		color: var(--tetriary);
		margin-bottom: 5px;
		font-family: var(--font-mono);
	}

	:global(.skill-description) {
		font-size: 14px;
		color: var(--secondary);
		margin-top: 15px;
		margin-bottom: 10px;
		font-style: italic;
		font-family: var(--font-mono);
	}

	:global(.skill-stats) {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 5px;
		margin-bottom: 10px;
		font-family: var(--font-mono);
	}

	:global(.stat) {
		font-size: 12px;
		color: var(--secondary);
	}
</style>
