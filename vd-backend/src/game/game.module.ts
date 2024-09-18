import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Character } from './entities/character.entity';
import { CharacterAvatar } from './entities/character-avatar.entity';
import { Stats } from './entities/stats.entity';
import { Equipment } from './entities/equipment.entity';
import { Inventory } from './entities/inventory.entity';
import { Slot } from './entities/slot.entity';
import { Item } from './entities/item.entity';
import { DungeonProgress } from './entities/dungeon-progress.entity';
import { GameController } from './game.controller';
import { GameGateway } from './gateway/game.gateway';
import { GameService } from './game.service';
import { InventoryService } from './inventory.service';
import { CharacterService } from './character.service';
import { ConnectionHandler } from './gateway/connection.handler';
import { MovementHandler } from './gateway/movement.handler';
import { CombatHandler } from './gateway/combat.handler';
import { InventoryHandler } from './gateway/inventory.handler';
import { PartyHandler } from './gateway/party.handler';
import { ChatHandler } from './gateway/chat.handler';
import { NpcHandler } from './gateway/npc.handler';
import { DungeonProgressService } from './dungeon-progress.service';
import { PartyManager } from './engine/party-manager';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
      Item,
      DungeonProgress,
    ]),
  ],
  providers: [
    GameGateway,
    GameService,
    JwtService,
    ConfigService,
    InventoryService,
    CharacterService,
    ConnectionHandler,
    MovementHandler,
    CombatHandler,
    InventoryHandler,
    PartyHandler,
    ChatHandler,
    NpcHandler,
    DungeonProgressService,
    PartyManager,
  ],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
