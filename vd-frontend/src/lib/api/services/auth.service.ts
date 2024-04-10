import { jwt, user } from '$lib/store/auth';

import { PUBLIC_API_HOST } from '$env/static/public';

class RegisterError {
	constructor(
		public message: string[],
		public statusCode: number
	) {}
}

export async function register(email: string, username: string, password: string) {
	const res = await fetch(`${PUBLIC_API_HOST}/auth/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ email, username, password })
	});
	if (!res.ok) {
		const json = await res.json();
		throw new RegisterError(json.message, json.statusCode);
	}
	return res.json();
}

export async function signIn(username: string, password: string) {
	const res = await fetch(`${PUBLIC_API_HOST}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ username, password })
	});
	if (!res.ok) {
		throw new Error('Failed to sign in');
	}
	return res.json();
}

export async function logOut() {
	jwt.set(null);
	user.set(null);
}
