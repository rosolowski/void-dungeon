import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory as InventoryEntity } from './entities/inventory.entity';
import { Item as ItemEntity } from './entities/item.entity';
import { ItemType } from './class/Item';
import { Equipment as EquipmentEntity } from './entities/equipment.entity';
import { Slot as SlotEntity } from './entities/slot.entity';
import { CharacterService } from './character.service';
import { Character as CharacterClass } from './class/Character';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryEntity)
    private inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(ItemEntity)
    private itemRepository: Repository<ItemEntity>,
    @InjectRepository(SlotEntity)
    private slotRepository: Repository<SlotEntity>,
    @InjectRepository(EquipmentEntity)
    private equipmentRepository: Repository<EquipmentEntity>,
    private characterService: CharacterService,
  ) {}

  async equipItem(
    character: CharacterClass,
    fromSlotIndex: number,
    equipmentSlot: ItemType,
  ): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: { character: { id: character.id } },
      relations: [
        'character',
        'equipment',
        'slots',
        'slots.item',
        'slots.item.stats',
      ],
    });

    if (!inventory) {
      throw new Error(`Inventory not found for character ID ${character.id}`);
    }

    // Find the source slot by fromSlotIndex
    const fromSlot = inventory.slots.find(
      (slot) => slot.index === fromSlotIndex,
    );
    if (!fromSlot || !fromSlot.item) {
      throw new Error(
        `Source slot with ID ${fromSlotIndex} is empty or does not exist`,
      );
    }

    // Prepare the item to be equipped from the source slot
    const itemToEquip = fromSlot.item;

    // Check if there's already an item in the target equipment slot
    const currentItemInEquipmentSlot = inventory.equipment[equipmentSlot];

    // If the target equipment slot is occupied, swap the items
    if (currentItemInEquipmentSlot) {
      // Move the currently equipped item back to the source slot
      fromSlot.item = currentItemInEquipmentSlot;
      await this.characterService.updateStatsOnUnequip(
        character,
        currentItemInEquipmentSlot,
      );
    } else {
      // If the equipment slot was empty, simply clear the source slot as the item is moving to equipment
      fromSlot.item = null;
    }

    // Equip the item by setting it in the specified equipment slot
    inventory.equipment[equipmentSlot] = itemToEquip;

    // Persist changes to the source slot and equipment
    await this.slotRepository.save(fromSlot);
    await this.equipmentRepository.save(inventory.equipment);

    await this.characterService.updateStatsOnEquip(character, itemToEquip);
  }

  async unequipItem(
    character: CharacterClass,
    equipmentSlot: ItemType,
  ): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: { character: { id: character.id } },
      relations: [
        'character',
        'equipment',
        'slots',
        'slots.item',
        'slots.item.stats',
      ],
    });

    if (!inventory) {
      throw new Error(`Inventory not found for character ID ${character.id}`);
    }

    // Check if the equipment slot is occupied
    const itemToUnequip = inventory.equipment[equipmentSlot];
    if (!itemToUnequip) {
      throw new Error(`No item is equipped in the ${equipmentSlot} slot.`);
    }

    // Find the first empty slot in the inventory
    const emptySlot = inventory.slots.find((slot) => !slot.item);
    if (!emptySlot) {
      throw new Error('No empty slots available in inventory.');
    }

    // Move the item to the empty slot
    emptySlot.item = itemToUnequip;
    inventory.equipment[equipmentSlot] = null;

    // Persist changes
    await this.slotRepository.save(emptySlot);
    await this.equipmentRepository.save(inventory.equipment);

    await this.characterService.updateStatsOnUnequip(character, itemToUnequip);
  }

  async unequipItemToSlot(
    character: CharacterClass,
    equipmentSlot: ItemType,
    targetSlotIndex: number,
  ): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: { character: { id: character.id } },
      relations: [
        'character',
        'equipment',
        'slots',
        'slots.item',
        'slots.item.stats',
      ],
    });

    if (!inventory) {
      throw new Error(`Inventory not found for character ID ${character.id}`);
    }

    // Ensure the item is currently equipped in the specified slot
    const itemToUnequip = inventory.equipment[equipmentSlot];
    if (!itemToUnequip) {
      throw new Error(`No item is equipped in the ${equipmentSlot} slot.`);
    }

    // Find the target slot by ID
    const targetSlot = inventory.slots.find(
      (slot) => slot.index === targetSlotIndex,
    );
    if (!targetSlot) {
      throw new Error(`Target slot with ID ${targetSlotIndex} does not exist.`);
    }

    if (targetSlot.item) {
      throw new Error(`Target slot with ID ${targetSlotIndex} is not empty.`);
    }

    // Move the item to the target slot
    targetSlot.item = itemToUnequip;
    inventory.equipment[equipmentSlot] = null;

    // Persist changes
    await this.slotRepository.save(targetSlot);
    await this.equipmentRepository.save(inventory.equipment);

    await this.characterService.updateStatsOnUnequip(character, itemToUnequip);
  }

  async moveItem(
    characterId: number,
    fromSlotIndex: number,
    targetSlotIndex: number,
  ): Promise<void> {
    // Fetch the inventory along with slots and items in those slots
    const inventory = await this.inventoryRepository.findOne({
      where: { character: { id: characterId } },
      relations: ['slots', 'slots.item'],
    });

    if (!inventory) {
      throw new Error(`Inventory not found for character ID ${characterId}`);
    }

    // Find the source and target slots by their IDs
    const fromSlot = inventory.slots.find(
      (slot) => slot.index === fromSlotIndex,
    );
    const targetSlot = inventory.slots.find(
      (slot) => slot.index === targetSlotIndex,
    );

    // Check the existence of both slots
    if (!fromSlot || !targetSlot) {
      throw new Error(
        `Either the source slot ID ${fromSlotIndex} or the target slot ID ${targetSlotIndex} does not exist.`,
      );
    }

    // Ensure the source slot is not empty
    if (!fromSlot.item) {
      throw new Error(`Source slot ID ${fromSlotIndex} is empty.`);
    }

    const itemToSwap = targetSlot.item;
    const itemToBeSwapped = fromSlot.item;

    targetSlot.item = null;
    fromSlot.item = null;

    await this.slotRepository.save([fromSlot, targetSlot]);

    // Move the item from the source slot to the target slot
    targetSlot.item = itemToBeSwapped;
    fromSlot.item = itemToSwap;

    // Save changes to both slots
    await this.slotRepository.save([fromSlot, targetSlot]);
  }

  async addItem(
    characterId: number,
    itemData: Partial<ItemEntity>,
  ): Promise<{ slotIndex: number; item: ItemEntity }> {
    // Fetch the character's inventory
    const inventory = await this.inventoryRepository.findOne({
      where: { character: { id: characterId } },
      relations: ['slots', 'slots.item'],
    });

    if (!inventory) {
      throw new Error(`Inventory not found for character ID ${characterId}`);
    }

    // Check for an empty slot in the inventory
    const emptySlot = inventory.slots.find((slot) => !slot.item);
    if (!emptySlot) {
      throw new Error('No empty slots available in inventory.');
    }

    let item: ItemEntity;
    if ('id' in itemData && itemData.id) {
      // If an id is provided in itemData, try to fetch the existing item
      item = await this.itemRepository.findOneBy({ id: itemData.id });
      if (!item) {
        throw new Error(`Item not found with ID ${itemData.id}`);
      }
    } else {
      // If no id is provided or the item does not exist, create a new item
      item = this.itemRepository.create(itemData);
      await this.itemRepository.save(item);
    }

    // Assign the item to the empty slot
    emptySlot.item = item;
    await this.slotRepository.save(emptySlot);

    return { slotIndex: emptySlot.index, item };
  }

  async deleteItem(characterId: number, itemId: number): Promise<void> {
    // Fetch the character's inventory along with slots and items
    const inventory = await this.inventoryRepository.findOne({
      where: { character: { id: characterId } },
      relations: ['slots', 'slots.item'],
    });

    if (!inventory) {
      throw new Error(`Inventory not found for character ID ${characterId}`);
    }

    // Find the slot containing the item to be deleted
    const itemSlot = inventory.slots.find(
      (slot) => slot.item && slot.item.id === itemId,
    );

    if (!itemSlot) {
      throw new Error(`Item with ID ${itemId} not found in the inventory.`);
    }

    // Remove the item from the slot
    itemSlot.item = null;

    // Save the updated slot
    await this.slotRepository.save(itemSlot);

    await this.itemRepository.delete({ id: itemId });
  }
}
