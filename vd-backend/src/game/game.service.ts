import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { JwtPayloadDto } from 'src/auth/dto/jwt.dto';
import { Character as CharacterClass } from './class/Character';
import { Inventory } from './entities/inventory.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getInventory(characterId: number): Promise<Inventory> {
    return await this.inventoryRepository.findOne({
      where: { character: { id: characterId } },
      relations: [
        'slots',
        'equipment',
        'equipment.weapon',
        'equipment.helmet',
        'equipment.talisman',
        'equipment.boots',
        'equipment.armor',
        'equipment.secondary',
        'slots.item',
      ],
    });
  }

  async getPlayerCharacter(
    userId: number,
    characterId: number,
  ): Promise<Character> {
    return await this.charactersRepository.findOne({
      where: { id: characterId, user: { id: userId } },
      relations: [
        'avatar',
        'stats',
        'inventory',
        'inventory.slots',
        'inventory.equipment',
        'inventory.equipment.weapon',
        'inventory.equipment.helmet',
        'inventory.equipment.talisman',
        'inventory.equipment.boots',
        'inventory.equipment.armor',
        'inventory.equipment.secondary',
        'inventory.slots.item',
      ],
    });
  }

  async validateSocketConnection(
    token: string,
    characterId: number,
  ): Promise<{ user: JwtPayloadDto; character: Character }> {
    try {
      // Decode and verify the JWT token
      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'default_secret',
      );
      const payload: JwtPayloadDto = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // Extract the user ID from the token's payload
      const userId = payload.id;

      // Verify whether the specified character belongs to the user
      const character = await this.getPlayerCharacter(userId, characterId);
      if (!character) {
        throw new Error('Character does not belong to user');
      }

      return {
        user: payload,
        character,
      };
    } catch (e) {
      throw new WsException('Unauthorized');
    }
  }

  async syncCharacter(characterClass: CharacterClass): Promise<void> {
    const characterEntity = await this.charactersRepository.findOneBy({
      id: characterClass.id,
    });

    if (!characterEntity) {
      throw new Error(`Character with ID ${characterClass.id} not found`);
    }

    // sync basic properties
    characterEntity.pos = characterClass.pos;
    characterEntity.level = characterClass.level;
    characterEntity.exp = characterClass.exp;
    characterEntity.maxExp = characterClass.maxExp;

    await this.charactersRepository.save(characterEntity);
  }
}
