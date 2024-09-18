import { Character } from 'src/game/entities/character.entity';
import { CharacterAvatar } from 'src/game/entities/character-avatar.entity';
import { Equipment } from 'src/game/entities/equipment.entity';
import { Inventory } from 'src/game/entities/inventory.entity';
import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { Slot } from 'src/game/entities/slot.entity';
import { Stats } from 'src/game/entities/stats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DungeonProgressService } from 'src/game/dungeon-progress.service';
import { DungeonProgress } from 'src/game/entities/dungeon-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Character,
      CharacterAvatar,
      Stats,
      Equipment,
      Inventory,
      Slot,
      DungeonProgress,
    ]),
  ],
  providers: [UsersService, JwtService, DungeonProgressService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
