import { Character } from './entities/character.entity';
import { CharacterAvatar } from './entities/character-avatar.entity';
import { ConfigService } from '@nestjs/config';
import { Equipment } from './entities/equipment.entity';
import { GameController } from './game.controller';
import { GameGateway } from './gateway/game.gateway';
import { GameService } from './game.service';
import { Inventory } from './entities/inventory.entity';
import { InventoryService } from './inventory.service';
import { Item } from './entities/item.entity';
import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { Slot } from './entities/slot.entity';
import { Stats } from './entities/stats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { CharacterService } from './character.service';
import { ConnectionHandler } from './gateway/connection.handler';
import { MovementHandler } from './gateway/movement.handler';
import { CombatHandler } from './gateway/combat.handler';
import { InventoryHandler } from './gateway/inventory.handler';
import { PartyHandler } from './gateway/party.handler';
import { ChatHandler } from './gateway/chat.handler';
import { NpcHandler } from './gateway/npc.handler';

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
  ],
  exports: [],
  controllers: [GameController],
})
export class GameModule {}
