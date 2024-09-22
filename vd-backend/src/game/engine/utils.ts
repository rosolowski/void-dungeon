import { Inventory as InventoryEntity } from '../entities/inventory.entity';

import { Character as CharacterClass } from '../class/Character';
import { Character as CharacterEntity } from '../entities/character.entity';
import { CharacterClass as CharacterClassType } from '../class/Character';
import { Equipment as EquipmentClass } from '../class/Equipment';
// import { Equipment as EquipmentEntity } from '../entities/equipment.entity';
import { Inventory as InventoryClass } from '../class/Inventory';
import { Item as ItemClass } from '../class/Item';
import { Item as ItemEntity } from '../entities/item.entity';
import { Stats as StatsEntity } from '../entities/stats.entity';
import { Stats as StatsClass } from '../class/Stats';
import { Entity as EntityClass } from '../class/Entity';

export enum Tile {
  EMPTY = 0,
  WALL = 1,
  FLOOR = 2,
  STAIRS = 3,
}

export enum Collision {
  BAD = 0,
  WALKABLE = 1,
}

export function terrainToCollisionMap(terrain: number[][]): number[][] {
  return terrain.map((row) =>
    row.map((cell) =>
      cell === Tile.EMPTY || cell === Tile.WALL
        ? Collision.BAD
        : Collision.WALKABLE,
    ),
  );
}

export function applyEntitiesToCollisionMap(
  collisionMap: number[][],
  entities: EntityClass[],
): number[][] {
  entities.forEach((entity) => {
    const { x, y } = entity.pos;
    collisionMap[y][x] = Collision.BAD;
  });

  return collisionMap;
}

export function characterEntityToCharacterClass(
  characterEntity: CharacterEntity,
): CharacterClass {
  return new CharacterClass(
    characterEntity.id,
    characterEntity.pos,
    characterEntity.name,
    characterEntity.level,
    characterEntity.stats,
    characterEntity.charClass as CharacterClassType,
    characterEntity.exp,
    characterEntity.maxExp,
    characterEntity.avatar,
    characterEntity.skillIds,
  );
}

export function inventoryEntityToInventoryClass(
  inventoryEntity: InventoryEntity,
): InventoryClass {
  const equipmentEntity = inventoryEntity.equipment;

  // Convert Entity Equipment to Class Equipment
  const equipment = new EquipmentClass(
    transformItemEntityToClass(equipmentEntity.helmet),
    transformItemEntityToClass(equipmentEntity.weapon),
    transformItemEntityToClass(equipmentEntity.secondary),
    transformItemEntityToClass(equipmentEntity.armor),
    transformItemEntityToClass(equipmentEntity.boots),
    transformItemEntityToClass(equipmentEntity.talisman),
  );

  // Convert Slot Entities to a Map of Items
  const slots = new Map<number, ItemClass>();
  inventoryEntity.slots.forEach((slot) => {
    slots.set(slot.index, transformItemEntityToClass(slot.item));
  });

  // Construct and return the Inventory class instance
  return new InventoryClass(
    slots,
    inventoryEntity.capacity,
    inventoryEntity.gold,
    inventoryEntity.shards,
    equipment,
  );
}

export function characterEntityToInventory(
  characterEntity: CharacterEntity,
): InventoryClass {
  return inventoryEntityToInventoryClass(characterEntity.inventory);
}

function transformItemEntityToClass(
  itemEntity: ItemEntity | null,
): ItemClass | null {
  if (!itemEntity) return null;
  const stats = new StatsClass();

  Object.keys(itemEntity.stats).forEach((key) => {
    if (key in stats) {
      stats[key] = itemEntity.stats[key];
    }
  });

  return new ItemClass(
    itemEntity.id,
    itemEntity.name,
    itemEntity.description,
    itemEntity.type,
    itemEntity.rarity,
    stats,
  );
}

export function transformItemClassToEntity(itemClass: ItemClass): ItemEntity {
  const statsEntity = new StatsEntity();

  Object.keys(itemClass.stats).forEach((key) => {
    if (key in statsEntity) {
      statsEntity[key] = itemClass.stats[key];
    }
  });

  const itemEntity = new ItemEntity();
  itemEntity.id = itemClass.id;
  itemEntity.name = itemClass.name;
  itemEntity.description = itemClass.description;
  itemEntity.type = itemClass.type;
  itemEntity.rarity = itemClass.rarity;
  itemEntity.stats = statsEntity;

  return itemEntity;
}
