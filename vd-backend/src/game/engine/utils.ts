import { Inventory as InventoryEntity } from '../entities/inventory.entity';

import { Character as CharacterClass } from '../class/Character';
import { Character as CharacterEntity } from '../entities/character.entity';
import { Equipment as EquipmentClass } from '../class/Equipment';
import { Equipment as EquipmentEntity } from '../entities/equipment.entity';
import { Inventory as InventoryClass } from '../class/Inventory';
import { Item as ItemClass } from '../class/Item';
import { Item as ItemEntity } from '../entities/item.entity';
import { Stats as StatsClass } from '../class/Stats';
import { Stats as StatsEntity } from '../entities/stats.entity';

export function terrainToCollisionMap(terrain: number[][]): number[][] {
  return terrain.map((row) =>
    row.map((cell) => (cell === 0 || cell === 1 ? 0 : 1)),
  );
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
    characterEntity.charClass,
    characterEntity.exp,
    characterEntity.maxExp,
    characterEntity.avatar,
  );
}

export function InventoryEntityToInventoryClass(
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
  return InventoryEntityToInventoryClass(characterEntity.inventory);
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
    stats,
  );
}
