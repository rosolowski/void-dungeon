import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import {
  AddCharacterDto,
  RemoveCharacterDto,
} from './dto/manage-character.dto';
import { Character } from 'src/game/entities/character.entity';
import { NEW_CHARACTER_BASE } from './constants';
import { Stats } from 'src/game/entities/stats.entity';
import { CharacterAvatar } from 'src/game/entities/character-avatar.entity';
import { Equipment } from 'src/game/entities/equipment.entity';
import { Inventory } from 'src/game/entities/inventory.entity';
import { Slot } from 'src/game/entities/slot.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    @InjectRepository(CharacterAvatar)
    private characterAvatarsRepository: Repository<CharacterAvatar>,
    @InjectRepository(Stats)
    private statsRepository: Repository<Stats>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Slot)
    private slotRepository: Repository<Slot>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }

  async findOneByUsernameWithCharacters(
    username: string,
  ): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.characters', 'character')
      .leftJoinAndSelect('character.stats', 'stats')
      .leftJoinAndSelect('character.avatar', 'avatar')
      .where('user.username = :username', { username })
      .getOne();
  }

  async createCharacterForUser(
    userId: number,
    characterData: AddCharacterDto,
  ): Promise<Character> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const defaultStats = {
      hp: 10,
      maxHp: 10,
      mana: 30,
      maxMana: 30,
      armor: 2,
      evasion: 0,
      damage: 5,
      attackSpeed: 1,
      critMultiplier: 1,
      critChance: 0.02,
      poisonDamage: 0,
      fireDamage: 0,
      coldDamage: 0,
      lightDamage: 0,
      voidDamage: 0,
      poisonChance: 0,
      fireChance: 0,
      coldChance: 0,
      lightChance: 0,
      voidChance: 0,
      poisonStatus: 0,
      fireStatus: 0,
      coldStatus: 0,
      lightStatus: 0,
      voidStatus: 0,
      extraCurrencyChance: 0,
      extraDropChance: 0,
      dropRarityBoost: 0,
    };

    // create avatar
    const newAvatar = this.characterAvatarsRepository.create({
      ...characterData.avatar,
    });
    await this.characterAvatarsRepository.save(newAvatar);

    // create character stats
    const newStats = this.statsRepository.create(defaultStats);
    await this.statsRepository.save(newStats);

    // create character base stats
    const newBaseStats = this.statsRepository.create();
    await this.statsRepository.save(newBaseStats);

    // create equipment
    const newEquipment = this.equipmentRepository.create();
    await this.equipmentRepository.save(newEquipment);

    // create inventory
    const newInventory = this.inventoryRepository.create({
      equipment: newEquipment,
    });
    await this.inventoryRepository.save(newInventory);

    // fill inventory with empty slots
    const slots = [];
    for (let i = 0; i < newInventory.capacity; i++) {
      const newSlot = this.slotRepository.create({
        inventory: newInventory,
        index: i,
        item: null,
      });
      slots.push(newSlot);
    }
    await this.slotRepository.save(slots);

    const character = this.charactersRepository.create({
      ...NEW_CHARACTER_BASE,
      name: characterData.name,
      charClass: characterData.class,
      stats: newStats,
      baseStats: newBaseStats,
      avatar: newAvatar,
      user,
      inventory: newInventory,
    });

    return this.charactersRepository.save(character);
  }

  async removeCharacterForUser(
    userId: number,
    removeCharacterDto: RemoveCharacterDto,
  ): Promise<void> {
    const { characterId } = removeCharacterDto;

    // check if character belongs to user
    const character = await this.charactersRepository.findOne({
      where: { id: characterId, user: { id: userId } },
      relations: ['user'],
    });

    if (!character) {
      throw new Error(
        `Character with ID ${characterId} not found for this user`,
      );
    }

    await this.charactersRepository.remove(character);
  }
}
