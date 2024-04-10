export class MoveResponseDto {
	constructor(
		public success: boolean,
		public newX: number,
		public newY: number
	) {}
}
