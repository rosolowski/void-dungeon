import type { AddCharacterDto, RemoveCharacterDto } from '../dto/manage-character.dto';

import { get } from 'svelte/store';
import { jwt } from '$lib/store/auth';

const VITE_API_HOST = import.meta.env.VITE_API_HOST;

export async function addCharacter(addCharacterData: AddCharacterDto) {
	const token = get(jwt);

	const res = await fetch(`${VITE_API_HOST}/users/add-character`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(addCharacterData)
	});
	if (!res.ok) {
		throw new Error('Failed to add character');
	}
	return res.json();
}

export async function removeCharacter(removeCharacterData: RemoveCharacterDto) {
	const token = get(jwt);

	const res = await fetch(`${VITE_API_HOST}/users/remove-character`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(removeCharacterData)
	});
	if (!res.ok) {
		throw new Error('Failed to remove character');
	}
	return res.json();
}

export async function getCharacters() {
	const token = get(jwt);

	const res = await fetch(`${VITE_API_HOST}/users/characters`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});
	if (!res.ok) {
		throw new Error('Failed to get characters');
	}
	return res.json();
}
