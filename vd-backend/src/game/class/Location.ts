export class Location {
  constructor(
    public terrain?: number[][],
    public collisionMap?: number[][],
    public width?: number,
    public height?: number,
    public spawnCoords?: { x: number; y: number },
  ) {}
}
