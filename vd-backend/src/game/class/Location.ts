import { MapGenerator } from './MapGenerator';
import { terrainToCollisionMap } from '../engine/utils';

export class Location {
  constructor(
    public terrain?: number[][],
    public collisionMap?: number[][],
    public width?: number,
    public height?: number,
    public spawnCoords?: { x: number; y: number },
  ) {}

  generate() {
    const mapGen = new MapGenerator(80, 50);
    mapGen.generateTerrain();

    const terrain = mapGen.getTerrain();

    this.terrain = terrain;
    this.collisionMap = terrainToCollisionMap(terrain);
    this.width = mapGen.width;
    this.height = mapGen.height;
    this.spawnCoords = mapGen.spawnPos;
  }
}
