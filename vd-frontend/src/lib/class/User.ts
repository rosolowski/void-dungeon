import type { Character } from './Character';

export class User {
	constructor(
		public id: number,
		public username: string,
		public email: string,
		public characters: Character[]
	) {}
}
