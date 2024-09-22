import { writable, derived, get } from 'svelte/store';
import { type Skill } from '$lib/class/Skill';
import { skillsArray } from './skills';

function createSkillManager() {
	const allSkills = writable(new Map(skillsArray.map((skill) => [skill.id, skill])));
	const playerSkillIds = writable<string[]>([]);

	const playerSkills = derived([allSkills, playerSkillIds], ([$allSkills, $playerSkillIds]) =>
		$playerSkillIds
			.map((id) => $allSkills.get(id))
			.filter((skill): skill is Skill => skill !== undefined)
	);

	return {
		subscribe: playerSkills.subscribe,
		getSkill: (id: string): Skill | undefined => get(allSkills).get(id),
		updatePlayerSkills: (skillIds: string[]) => playerSkillIds.set(skillIds)
	};
}

export const skillManager = createSkillManager();
