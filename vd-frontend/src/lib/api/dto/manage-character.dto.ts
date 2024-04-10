export interface CharacterAvatarDto {
	beard: number;
	hair: number;
	eyes: number;
	nose: number;
	mouth: number;
	head: number;
}

export interface AddCharacterDto {
	name: string;
	class: string;
	avatar: CharacterAvatarDto;
}

export interface RemoveCharacterDto {
	characterId: number;
}
