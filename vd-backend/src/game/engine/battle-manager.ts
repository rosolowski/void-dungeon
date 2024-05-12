import { Entity } from '../class/Entity';

// attack is always initiated by character and target is an entity

export interface AttackLog {
  characterId: number;
  entityId: number;
  characterDamageTaken: number;
  entityDamageTaken: number;
  characterDied: boolean;
  entityDied: boolean;
}

export function simulateAttack(character: Entity, entity: Entity): AttackLog {
  const entityBlock = Math.floor(Math.random() * entity.stats.armor);
  const entityDamageTaken = Math.max(character.stats.damage - entityBlock, 0);

  const characterBlock = Math.floor(Math.random() * character.stats.armor);
  const characterDamageTaken = Math.max(
    entity.stats.damage - characterBlock,
    0,
  );

  const characterDied = character.stats.hp - characterDamageTaken <= 0;
  const entityDied = entity.stats.hp - entityDamageTaken <= 0;

  return {
    characterId: character.id,
    entityId: entity.id,
    characterDamageTaken,
    entityDamageTaken,
    characterDied,
    entityDied,
  };
}
