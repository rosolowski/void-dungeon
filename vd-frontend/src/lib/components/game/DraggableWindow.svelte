<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { device } from '$lib/store/device';

	export let zIndex: number;
	let x = 300;
	let y = 300;
	let dragging = false;
	let closing = false;
	let draggableWindowElement: HTMLElement;

	function centerWindow() {
		const totalWidth = draggableWindowElement.offsetWidth;
		const totalHeight = draggableWindowElement.offsetHeight;

		x = (window.innerWidth - totalWidth) / 2;
		y = (window.innerHeight - totalHeight) / 2;
	}

	onMount(() => {
		centerWindow();
	});

	const dispatch = createEventDispatcher();

	function startDrag(event: MouseEvent) {
		if ($device.isMobile) return;

		event.preventDefault();
		dragging = true;
		const startX = event.clientX - x;
		const startY = event.clientY - y;

		function onMouseMove(event: MouseEvent) {
			if (dragging) {
				let newX = event.clientX - startX;
				let newY = event.clientY - startY;

				const totalWidth = draggableWindowElement.offsetWidth;
				const totalHeight = draggableWindowElement.offsetHeight;

				newX = Math.max(0, Math.min(newX, window.innerWidth - totalWidth));
				newY = Math.max(0, Math.min(newY, window.innerHeight - totalHeight));

				x = newX;
				y = newY;
			}
		}

		function onMouseUp() {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			dragging = false;
		}

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	}

	function closeWindow() {
		closing = true;
		setTimeout(() => {
			dispatch('close');
		}, 200);
	}

	function bringToFront() {
		dispatch('bringToFront');
	}

	$: customStyle = $device.isMobile
		? `z-index: ${zIndex};`
		: `left: ${x}px; top: ${y}px; z-index: ${zIndex};`;
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="draggable-window"
	class:mobile={$device.isMobile}
	class:closing
	class:dragging
	style={customStyle}
	role="dialog"
	aria-labelledby="windowTitle"
	tabindex="0"
	bind:this={draggableWindowElement}
	on:mousedown={bringToFront}
>
	<div class="title-bar" on:mousedown={startDrag} tabindex="0">
		<div id="windowTitle" class="title"><slot name="title" /></div>
		<button class="close" on:click={closeWindow} aria-label="Close window" tabindex="0">
			[x]
		</button>
	</div>
	<slot name="content" />
</div>

<style lang="scss">
	.draggable-window {
		width: max-content;
		height: max-content;
		border: 1px solid var(--tetriary);
		background: var(--background);
		position: absolute;
		top: 300px;
		left: 300px;
		animation: appear 0.15s;
		box-shadow: 2px 2px 8px var(--background);
		user-select: none;
		z-index: var(--zi-windows);

		&.dragging {
			cursor: move;
		}

		&.closing {
			animation: closing 0.2s;
		}

		&.mobile {
			position: fixed;
			width: 100vw;
			height: 100vh;
			top: 0px;
			left: 0px;
			margin: auto;
			background: var(--background-transparency);

			.title-bar {
				.title {
					padding: 15px;
				}

				.close {
					padding: 15px;
				}
			}
		}
	}

	.title-bar {
		background-color: var(--background);
		cursor: move;
		border-bottom: 1px solid var(--tetriary);
		display: flex;
		justify-content: space-between;
		align-items: stretch;

		.title {
			padding: 5px;
		}

		.close {
			padding: 5px;
			cursor: pointer;
		}

		&:active {
			color: var(--secondary);
		}
	}

	@keyframes appear {
		0% {
			opacity: 0;
			transform: translateY(20px) scale(0.5);
		}
		100% {
			opacity: 1;
			transform: translateY(0px) scale(1);
		}
	}

	@keyframes closing {
		0% {
			opacity: 1;
			scale: 1;
		}
		100% {
			opacity: 0;
			scale: 0.7;
		}
	}
</style>
