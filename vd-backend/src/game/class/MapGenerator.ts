import { Tile } from '../engine/utils';
import { Entity } from './Entity';
import { EntityGenerator } from './EntityGenerator';

class Room {
  constructor(
    public globalX: number = 0,
    public globalY: number = 0,
    public width: number = 0,
    public height: number = 0,
    public terrain: number[][] = [],
  ) {}
}

export class MapGenerator {
  entities: Entity[] = [];
  rooms: Room[] = [];
  terrain: number[][] = [];
  entityOccupied: boolean[][];
  height: number = 0;
  width: number = 0;

  rectRoomChance = 0.3;
  circRoomChance = 0.2;
  lShapedRoomChance = 0.2;
  crossShapedRoomChance = 0.1;

  RECT_ROOM_MIN_SIZE = 5;
  RECT_ROOM_MAX_SIZE = 10;

  CIRCULAR_ROOM_MIN_RADIUS = 5;
  CIRCULAR_ROOM_MAX_RADIUS = 9;

  MIN_DISTANCE_BETWEEN_ROOMS = 2;

  spawnPos: { x: number; y: number };
  exitPos: { x: number; y: number };

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.entityOccupied = Array.from({ length: this.height }, () =>
      Array(this.width).fill(false),
    );
  }

  getTerrain(): number[][] {
    return this.terrain;
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  getEntities(): Entity[] {
    return this.entities;
  }

  setSpawn() {
    const firstRoom = this.rooms[0];
    const spawn = this.findFloorInRoom(firstRoom, false);
    this.spawnPos = spawn;
    return spawn;
  }

  setExit() {
    const lastRoom = this.rooms[this.rooms.length - 1];
    const exit = this.findFloorInRoom(lastRoom, true);
    this.exitPos = exit;
    return exit;
  }

  spawnEntities(level: number, instanceId: number) {
    let entityIndex = 0;
    this.rooms.forEach((room, index) => {
      if (index === 0) return;
      const numEntities = Math.floor(Math.random() * 5) + 1;

      for (let i = 0; i < numEntities; i++) {
        const pos = this.findRandomFloorInRoom(room);
        if (!pos) continue;
        if (
          this.exitPos &&
          pos.x === this.exitPos.x &&
          pos.y === this.exitPos.y
        )
          continue;

        const entity = EntityGenerator.createEntity(entityIndex++, level, {
          x: pos.x,
          y: pos.y,
          instanceId,
        });

        this.entities.push(entity);
        this.entityOccupied[pos.y][pos.x] = true;
      }
    });

    // Spawn chests
    this.spawnChests(level, instanceId, entityIndex);
  }

  private spawnChests(level: number, instanceId: number, startIndex: number) {
    const numChests = Math.floor(Math.random() * 3) + 1; // 1 to 3 chests per floor
    for (let i = 0; i < numChests; i++) {
      const randomRoom =
        this.rooms[Math.floor(Math.random() * this.rooms.length)];
      const pos = this.findRandomFloorInRoom(randomRoom);
      if (!pos) continue;

      const chest = EntityGenerator.createEntity(
        startIndex + i,
        level,
        {
          x: pos.x,
          y: pos.y,
          instanceId,
        },
        'chest',
      );

      this.entities.push(chest);
      this.entityOccupied[pos.y][pos.x] = true;
    }
  }

  generateTerrainAndEntities(level: number, instanceId: number) {
    this.terrain = Array.from({ length: this.height }, () =>
      Array(this.width).fill(0),
    );
    const gridSize = this.RECT_ROOM_MAX_SIZE;
    const gridWidth = Math.ceil(this.width / gridSize);
    const gridHeight = Math.ceil(this.height / gridSize);

    for (let gy = 0; gy < gridHeight; gy++) {
      for (let gx = 0; gx < gridWidth; gx++) {
        const choice = Math.random();
        if (choice < 0.2) continue;

        const room = this.generateRoom();
        const x = gx * gridSize + this.MIN_DISTANCE_BETWEEN_ROOMS;
        const y = gy * gridSize + this.MIN_DISTANCE_BETWEEN_ROOMS;

        if (x + room.width < this.width && y + room.height < this.height) {
          room.globalX = x;
          room.globalY = y;
          this.rooms.push(room);
          this.mergeRoomTerrain(room);
        }
      }
    }

    this.connectRooms();
    this.setSpawn();
    this.setExit();
    this.spawnEntities(level, instanceId);
  }

  findRandomFloorInRoom(room: Room): { x: number; y: number } | null {
    const floorPositions = [];
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        const globalX = room.globalX + x;
        const globalY = room.globalY + y;
        if (
          this.terrain[globalY][globalX] === Tile.FLOOR &&
          !this.entityOccupied[globalY][globalX]
        ) {
          floorPositions.push({ x: globalX, y: globalY });
        }
      }
    }
    if (floorPositions.length === 0) return null;
    return floorPositions[Math.floor(Math.random() * floorPositions.length)];
  }

  chooseEntityType(): string {
    const types = ['Snake', 'Goblin', 'Vampire'];
    return types[Math.floor(Math.random() * types.length)];
  }

  calculateEntityLevel(level: number): number {
    return Math.floor(Math.random() * level) + 1;
  }

  findFloorInRoom(room: Room, markExit: boolean) {
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        if (room.terrain[y][x] === Tile.FLOOR) {
          const tileX = room.globalX + x;
          const tileY = room.globalY + y;
          if (markExit) {
            this.terrain[tileY][tileX] = Tile.STAIRS;
          }
          return { x: tileX, y: tileY };
        }
      }
    }
    return null;
  }

  connectRooms() {
    for (let i = 0; i < this.rooms.length - 1; i++) {
      const roomA = this.getRoomCenter(this.rooms[i]);
      const roomB = this.getRoomCenter(this.rooms[i + 1]);
      this.createCorridor(roomA, roomB);
    }
  }

  createCorridor(from: { x: number; y: number }, to: { x: number; y: number }) {
    let currentX = from.x;
    let currentY = from.y;

    while (currentX !== to.x || currentY !== to.y) {
      this.terrain[currentY][currentX] = Tile.FLOOR;
      const randomChoice = Math.random();

      if (randomChoice < 0.5) {
        if (currentX !== to.x) {
          currentX += Math.sign(to.x - currentX);
        } else {
          currentY += Math.sign(to.y - currentY);
        }
      } else {
        if (currentY !== to.y) {
          currentY += Math.sign(to.y - currentY);
        } else {
          currentX += Math.sign(to.x - currentX);
        }
      }
    }
  }

  getRoomCenter(room: Room): { x: number; y: number } {
    const centerX = Math.floor(room.globalX + room.width / 2);
    const centerY = Math.floor(room.globalY + room.height / 2);
    return { x: centerX, y: centerY };
  }

  generateRoom(): Room {
    const choice = Math.random();
    if (choice < this.rectRoomChance) {
      return this.generateRectRoom();
    } else if (choice < this.rectRoomChance + this.circRoomChance) {
      return this.generateCircularRoom();
    } else if (
      choice <
      this.rectRoomChance + this.circRoomChance + this.lShapedRoomChance
    ) {
      return this.generateLShapedRoom();
    } else if (
      choice <
      this.rectRoomChance +
        this.circRoomChance +
        this.lShapedRoomChance +
        this.crossShapedRoomChance
    ) {
      return this.generateCrossShapedRoom();
    } else {
      return this.generateRectRoom();
    }
  }

  generateRectRoom(): Room {
    const roomWidth =
      Math.floor(
        Math.random() * (this.RECT_ROOM_MAX_SIZE - this.RECT_ROOM_MIN_SIZE + 1),
      ) + this.RECT_ROOM_MIN_SIZE;
    const roomHeight =
      Math.floor(
        Math.random() * (this.RECT_ROOM_MAX_SIZE - this.RECT_ROOM_MIN_SIZE + 1),
      ) + this.RECT_ROOM_MIN_SIZE;

    const terrain: number[][] = Array.from({ length: roomHeight }, () =>
      Array(roomWidth).fill(Tile.WALL),
    );

    for (let y = 1; y < roomHeight - 1; y++) {
      for (let x = 1; x < roomWidth - 1; x++) {
        terrain[y][x] = Tile.FLOOR;
      }
    }

    const room = new Room(0, 0, roomWidth, roomHeight, terrain);

    return room;
  }

  generateCircularRoom(): Room {
    const radius =
      Math.floor(
        Math.random() *
          (this.CIRCULAR_ROOM_MAX_RADIUS - this.CIRCULAR_ROOM_MIN_RADIUS + 1),
      ) + this.CIRCULAR_ROOM_MIN_RADIUS;
    const diameter = 2 * radius;
    const terrain: number[][] = Array.from({ length: diameter }, () =>
      Array(diameter).fill(0),
    );

    const wallRadius = radius - 0.5;
    const floorRadius = radius - 1.5;

    for (let y = 0; y < diameter; y++) {
      for (let x = 0; x < diameter; x++) {
        const distance = Math.sqrt(
          Math.pow(x - radius, 2) + Math.pow(y - radius, 2),
        );
        if (distance <= wallRadius) {
          terrain[y][x] = Tile.WALL;
        }
        if (distance < floorRadius) {
          terrain[y][x] = Tile.FLOOR;
        }
      }
    }

    const room = new Room(0, 0, diameter, diameter, terrain);
    return room;
  }

  generateLShapedRoom(): Room {
    const width =
      Math.floor(
        Math.random() * (this.RECT_ROOM_MAX_SIZE - this.RECT_ROOM_MIN_SIZE + 1),
      ) + this.RECT_ROOM_MIN_SIZE;
    const height =
      Math.floor(
        Math.random() * (this.RECT_ROOM_MAX_SIZE - this.RECT_ROOM_MIN_SIZE + 1),
      ) + this.RECT_ROOM_MIN_SIZE;
    const terrain: number[][] = Array.from({ length: height }, () =>
      Array(width).fill(Tile.WALL),
    );

    const splitX = Math.floor(width / 2);
    const splitY = Math.floor(height / 2);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (x < splitX || y >= splitY) {
          terrain[y][x] = Tile.FLOOR;
        }
      }
    }

    return new Room(0, 0, width, height, terrain);
  }

  generateCrossShapedRoom(): Room {
    const size =
      Math.floor(
        Math.random() * (this.RECT_ROOM_MAX_SIZE - this.RECT_ROOM_MIN_SIZE + 1),
      ) + this.RECT_ROOM_MIN_SIZE;
    const terrain: number[][] = Array.from({ length: size }, () =>
      Array(size).fill(Tile.WALL),
    );

    const corridorWidth = Math.max(3, Math.floor(size / 3));
    const start = Math.floor((size - corridorWidth) / 2);
    const end = start + corridorWidth;

    for (let y = start; y < end; y++) {
      for (let x = 1; x < size - 1; x++) {
        terrain[y][x] = Tile.FLOOR;
      }
    }

    for (let x = start; x < end; x++) {
      for (let y = 1; y < size - 1; y++) {
        terrain[y][x] = Tile.FLOOR;
      }
    }

    return new Room(0, 0, size, size, terrain);
  }

  mergeRoomTerrain(room: Room) {
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        if (room.terrain[y][x] !== 0) {
          this.terrain[room.globalY + y][room.globalX + x] = room.terrain[y][x];
        }
      }
    }
  }

  printAsString(terrain: number[][]) {
    let output = '';

    for (const row of terrain) {
      for (const c of row) output += c.toString();

      output += '\n';
    }

    console.log(output);
  }
}
