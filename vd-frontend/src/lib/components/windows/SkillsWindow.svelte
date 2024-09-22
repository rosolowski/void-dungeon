<script lang="ts">
	import { skillManager } from '$lib/store/skill-manager';
	import { socket } from '$lib/store/ws';
	import { get } from 'svelte/store';
	import type { Skill, SkillRarity } from '$lib/class/Skill';

	let skills: Skill[] = [];
	skillManager.subscribe((value) => {
		skills = value;
	});

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

	function removeSkill(skillId: string) {
		const client = get(socket);
		if (!client) return;

		client.emit('removeSkill', { skillId });
	}

	function reorderSkills(event: DragEvent, targetIndex: number) {
		event.preventDefault();
		const draggedSkillId = event.dataTransfer?.getData('text/plain');
		if (!draggedSkillId) return;

		const client = get(socket);
		if (!client) return;

		client.emit('reorderSkills', { skillId: draggedSkillId, newIndex: targetIndex });
	}

	function handleDragStart(event: DragEvent, skill: Skill) {
		event.dataTransfer?.setData('text/plain', skill.id);
	}

	function getSkillRarityClass(skill: Skill): string {
		return skill.rarity.toLowerCase();
	}
</script>

<div class="skills-window">
	<div class="title">SKILLS</div>
	{#if skills.length > 0}
		<p>Drag and drop skills to reorder. You can remove skill to free up slots.</p>
		<div class="skill-list">
			{#each skills as skill, index}
				<div class="skill-item-container">
					<div class="skill-index">{index + 1}</div>
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="skill-item {getSkillRarityClass(skill)}"
						draggable="true"
						on:dragstart={(e) => handleDragStart(e, skill)}
						on:dragover={(e) => e.preventDefault()}
						on:drop={(e) => reorderSkills(e, index)}
					>
						<div class="skill-header">
							<span class="skill-name">{skill.name}</span>
							<button class="danger" on:click={() => removeSkill(skill.id)}>[REMOVE]</button>
						</div>
						<div class="skill-details">
							<div class="skill-rarity" style="color: {getRarityColor(skill.rarity)};">
								{skill.rarity.charAt(0).toUpperCase() + skill.rarity.toLowerCase().slice(1)}
							</div>
							<div class="skill-type">{skill.targetType === 'passive' ? 'PASSIVE' : `ACTIVE`}</div>
							<div class="skill-type">
								{skill.targetType === 'passive' ? '' : `Target: ${skill.targetType}`}
							</div>
							<div class="skill-description">{skill.description}</div>
							<div class="skill-stats">
								{#if skill.targetType !== 'passive'}
									<div class="stat">Mana Cost: <span class="mana-cost">{skill.manaCost}</span></div>
								{/if}
								<div class="stat">Required Level: {skill.minLevel}</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p>
			You get a random skill each floor. When you get skills you can drag them to change order or
			remove to free up slots.
		</p>
	{/if}
</div>

<style lang="scss">
	.skills-window {
		width: 500px;
		max-height: 600px;
		min-height: 200px;
		overflow-y: scroll;
		padding: 20px;
		background-color: var(--background);
		border: 1px solid var(--tetriary);
		font-family: var(--font-mono);
	}

	p {
		color: var(--secondary);
		font-size: 14px;
		text-align: center;
		margin-bottom: 40px;
	}

	.title {
		display: flex;
		justify-content: space-around;
		align-items: center;
		user-select: none;
		padding-bottom: 15px;
		color: var(--secondary);

		&::before,
		&::after {
			content: '';
			flex: 1;
			height: 1px;
			margin: 0 10px;
		}

		&::before {
			background-image: linear-gradient(to left, var(--tetriary), transparent);
		}

		&::after {
			background-image: linear-gradient(to right, var(--tetriary), transparent);
		}
	}

	.skill-list {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.skill-item-container {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.skill-index {
		font-size: 24px;
		padding-right: 10px;
	}

	.skill-item {
		background-color: var(--background-secondary);
		border: 1px solid var(--tetriary);
		padding: 10px;
		cursor: move;
		flex: 1;
		transition: all 0.2s ease;

		&.common {
			border-color: var(--rarityCommon);
			box-shadow: inset 0 0 36px -16px var(--rarityCommon);
		}
		&.uncommon {
			border-color: var(--rarityUncommon);
			box-shadow: inset 0 0 36px -16px var(--rarityUncommon);
		}
		&.rare {
			border-color: var(--rarityRare);
			box-shadow: inset 0 0 36px -16px var(--rarityRare);
		}
		&.epic {
			border-color: var(--rarityEpic);
			box-shadow: inset 0 0 36px -16px var(--rarityEpic);
		}
		&.legendary {
			border-color: var(--rarityLegendary);
			box-shadow: inset 0 0 36px -16px var(--rarityLegendary);
		}
	}

	.skill-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 5px;
	}

	.skill-name {
		font-size: 18px;
		font-weight: bold;
		color: var(--primary);
	}

	.remove-btn {
		background: none;
		border: none;
		color: var(--special-red);
		cursor: pointer;
		font-size: 14px;
		padding: 2px 5px;

		&:hover {
			background-color: var(--special-red);
			color: var(--background);
		}
	}

	.skill-details {
		font-size: 14px;
	}

	.skill-rarity {
		font-size: 14px;
		font-weight: bold;
		margin-bottom: 5px;
		font-family: var(--font-mono);
	}

	.skill-type {
		color: var(--tetriary);
		margin-bottom: 5px;
	}

	.skill-description {
		color: var(--secondary);
		margin-bottom: 10px;
		font-style: italic;
	}

	.skill-stats {
		display: flex;
		justify-content: space-between;
	}

	.stat {
		color: var(--secondary);
	}

	.mana-cost {
		color: var(--manaLight);
	}
</style>
