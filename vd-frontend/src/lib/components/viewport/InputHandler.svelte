<script lang="ts">
	import { movePlayer } from '$lib/api/services/game.service';
	import { renderer } from '$lib/store/renderer';
	import { chat } from '$lib/store/chat';
	import { throttle } from '$lib/util/utils';

	type directions = 'up' | 'down' | 'left' | 'right';

	let direction: directions = 'right';
	let keys = [0, 0, 0, 0];

	function isMoving() {
		return keys[0] || keys[1] || keys[2] || keys[3];
	}

	function startDirection(key: number, dir: directions) {
		if ($chat.isActive) return;
		direction = dir;
		if (!isMoving()) movePlayerLoop();
		keys[key] = 1;
	}

	function onKeyDown(e: KeyboardEvent) {
		if ($chat.isActive) return;
		switch (e.keyCode) {
			case 38:
			case 87:
				startDirection(0, 'up');
				break;
			case 40:
			case 83:
				startDirection(2, 'down');
				break;
			case 37:
			case 65:
				startDirection(3, 'left');
				break;
			case 39:
			case 68:
				startDirection(1, 'right');
				break;
		}
	}

	function onKeyUp(e: KeyboardEvent) {
		if ($chat.isActive) return;
		switch (e.keyCode) {
			case 38:
			case 87:
				keys[0] = 0;
				updateDirection();
				break;
			case 40:
			case 83:
				keys[2] = 0;
				updateDirection();
				break;
			case 37:
			case 65:
				keys[3] = 0;
				updateDirection();
				break;
			case 39:
			case 68:
				keys[1] = 0;
				updateDirection();
				break;
		}
	}

	function updateDirection() {
		if (keys[0] == 1) direction = 'up';
		if (keys[1] == 1) direction = 'right';
		if (keys[2] == 1) direction = 'down';
		if (keys[3] == 1) direction = 'left';
	}

	const movePlayerLoop = throttle(() => {
		movePlayer(direction);
		setTimeout(() => {
			if (isMoving()) movePlayerLoop();
		}, 125);
	}, 100);
</script>

<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />
