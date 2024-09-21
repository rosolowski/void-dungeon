import { get, writable } from 'svelte/store';

import { Character } from '$lib/class/Character';
import { characterId } from './auth';

export const characters = writable<Map<number, Character>>(new Map());

export function handlePositionUpdate(data: { characterId: number; x: number; y: number }) {
	const id = data.characterId;

	characters.update((currentCharacters) => {
		const newCharacters = new Map(currentCharacters);
		const character = newCharacters.get(id);

		if (!character) return currentCharacters;

		character.pos.x = data.x;
		character.pos.y = data.y;
		return newCharacters;
	});
}

export function inititalize(data: Array<Character>) {
	const newCharacters: Map<number, Character> = new Map();
	for (const character of data) {
		if (character.id === get(characterId)) continue;
		newCharacters.set(character.id, character);
	}

	characters.set(newCharacters);
}

export function spawnCharacter(newCharacter: Character) {
	characters.update((currentCharacters) => {
		const newCharacters = new Map(currentCharacters);
		newCharacters.set(newCharacter.id, newCharacter);
		return newCharacters;
	});
}

export function removeCharacter(id: number) {
	characters.update((currentCharacters) => {
		const newCharacters = new Map(currentCharacters);
		newCharacters.delete(id);
		return newCharacters;
	});
}
