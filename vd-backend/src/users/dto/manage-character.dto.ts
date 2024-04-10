export class CharacterAvatarDto {
  beard: number;
  hair: number;
  eyes: number;
  nose: number;
  mouth: number;
  head: number;
}

export class AddCharacterDto {
  name: string;
  class: string;
  avatar: CharacterAvatarDto;
}

export class RemoveCharacterDto {
  characterId: number;
}
