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
import {
  CharacterClass,
  isValidCharacterClass,
} from 'src/game/class/Character';
import { DungeonProgressService } from 'src/game/dungeon-progress.service';
import { DungeonProgress } from 'src/game/entities/dungeon-progress.entity';

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
    @InjectRepository(DungeonProgress)
    private dungeonProgressRepository: Repository<DungeonProgress>,
    private readonly dungeonProgressService: DungeonProgressService,
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

  private getBaseStatsForClass(charClass: CharacterClass): Partial<Stats> {
    switch (charClass) {
      case 'Blood Knight':
        return {
          hp: 20,
          maxHp: 20,
          mana: 5,
          maxMana: 5,
          armor: 3,
          damage: 6,
          attackSpeed: 1,
          critChance: 0.03,
          critMultiplier: 1,
        };
      case 'Berserk':
        return {
          hp: 12,
          maxHp: 12,
          mana: 15,
          maxMana: 15,
          armor: 1,
          damage: 8,
          attackSpeed: 1.5,
          critChance: 5,
          critMultiplier: 1,
        };
      case 'Toxin Rogue':
        return {
          hp: 10,
          maxHp: 10,
          mana: 25,
          maxMana: 25,
          armor: 1,
          damage: 4,
          evasion: 5,
          attackSpeed: 1,
          critChance: 0.5,
          critMultiplier: 1,
          poisonDamage: 2,
          poisonChance: 5,
        };
      case 'Shadow Monk':
        return {
          hp: 12,
          maxHp: 12,
          mana: 30,
          maxMana: 30,
          armor: 2,
          damage: 5,
          attackSpeed: 1.3,
          critChance: 1,
          critMultiplier: 1,
          evasion: 5,
        };
      case 'Battle Mage':
        return {
          hp: 10,
          maxHp: 10,
          mana: 35,
          maxMana: 35,
          armor: 1,
          damage: 4,
          attackSpeed: 1,
          critChance: 0.5,
          critMultiplier: 1,
          fireDamage: 2,
          coldDamage: 2,
          fireChance: 5,
          coldChance: 5,
        };
      default:
        throw new Error('Invalid character class');
    }
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

    if (!isValidCharacterClass(characterData.class)) {
      throw new Error('Invalid character class');
    }

    const baseStats = this.getBaseStatsForClass(characterData.class);

    // create avatar
    const newAvatar = this.characterAvatarsRepository.create({
      ...characterData.avatar,
    });
    await this.characterAvatarsRepository.save(newAvatar);

    // create character stats
    const newStats = this.statsRepository.create(baseStats);
    await this.statsRepository.save(newStats);

    // create character base stats
    const newBaseStats = this.statsRepository.create(baseStats);
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

    // create DungeonProgress
    const newDungeonProgress = this.dungeonProgressRepository.create();
    await this.dungeonProgressRepository.save(newDungeonProgress);

    const character = this.charactersRepository.create({
      ...NEW_CHARACTER_BASE,
      name: characterData.name,
      charClass: characterData.class,
      stats: newStats,
      baseStats: newBaseStats,
      avatar: newAvatar,
      user,
      inventory: newInventory,
      dungeonProgress: newDungeonProgress,
      skillIds: [],
    });

    const savedCharacter = await this.charactersRepository.save(character);

    return savedCharacter;
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
