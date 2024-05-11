import { Entity } from './Entity';
import { EntityGenerator } from './EntityGenerator';

class Room {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public width: number = 0,
    public height: number = 0,
    public terrain: number[][] = [],
  ) {}
}

export class MapGenerator {
  entities: Entity[] = [];
  rooms: Room[] = [];
  terrain: number[][] = [];
  height: number = 0;
  width: number = 0;

  rectRoomChance = 0.4;
  circRoomChance = 0.2;

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
    this.rooms.forEach((room, index) => {
      if (index === 0) return;
      const numEntities = Math.floor(Math.random() * 5);
      const occupiedPositions = new Set();

      for (let i = 0; i < numEntities; i++) {
        const pos = this.findRandomFloorInRoom(room, occupiedPositions);
        if (!pos) continue;

        const entityType = this.chooseEntityType();
        const entityLevel = this.calculateEntityLevel(level);

        const entity = EntityGenerator.createEntity(entityType, entityLevel, {
          x: pos.x,
          y: pos.y,
          instanceId,
        });

        this.entities.push(entity);
        occupiedPositions.add(`${pos.x},${pos.y}`);
      }
    });
  }

  findRandomFloorInRoom(
    room: Room,
    occupiedPositions: Set<string>,
  ): { x: number; y: number } | null {
    const floorPositions = [];
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        if (
          room.terrain[y][x] === 2 &&
          !occupiedPositions.has(`${room.x + x},${room.y + y}`)
        ) {
          floorPositions.push({ x: room.x + x, y: room.y + y });
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
        if (room.terrain[y][x] === 2) {
          const tileX = room.x + x;
          const tileY = room.y + y;
          if (markExit) {
            this.terrain[tileY][tileX] = 3;
          }
          return { x: tileX, y: tileY };
        }
      }
    }
    return null;
  }

  generateTerrain() {
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
          room.x = x;
          room.y = y;
          this.rooms.push(room);
          this.mergeRoomTerrain(room);
        }
      }
    }

    this.connectRooms();

    this.setSpawn();
    this.setExit();
    // this.printAsString(this.terrain);
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
      this.terrain[currentY][currentX] = 2; // floor
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
    const centerX = Math.floor(room.x + room.width / 2);
    const centerY = Math.floor(room.y + room.height / 2);
    return { x: centerX, y: centerY };
  }

  generateRoom(): Room {
    const choice = Math.random();
    if (choice < this.rectRoomChance) {
      return this.generateRectRoom();
    } else if (choice < this.rectRoomChance + this.circRoomChance) {
      return this.generateCircularRoom();
    } else {
      // placeholder
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
      Array(roomWidth).fill(1),
    );

    for (let y = 1; y < roomHeight - 1; y++) {
      for (let x = 1; x < roomWidth - 1; x++) {
        terrain[y][x] = 2;
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

    for (let y = 0; y < diameter; y++) {
      for (let x = 0; x < diameter; x++) {
        if (
          Math.sqrt(Math.pow(x - radius, 2) + Math.pow(y - radius, 2)) <= radius
        ) {
          terrain[y][x] = 1;
        }
        if (
          Math.sqrt(Math.pow(x - radius, 2) + Math.pow(y - radius, 2)) <
          radius - 1
        ) {
          terrain[y][x] = 2;
        }
      }
    }

    const room = new Room(0, 0, diameter, diameter, terrain);
    return room;
  }

  mergeRoomTerrain(room: Room) {
    for (let y = 0; y < room.height; y++) {
      for (let x = 0; x < room.width; x++) {
        if (room.terrain[y][x] !== 0)
          this.terrain[room.y + y][room.x + x] = room.terrain[y][x];
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
