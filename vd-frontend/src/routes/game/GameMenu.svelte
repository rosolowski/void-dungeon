<script>
	import logo from '$lib/assets/vd-logo.png';
	import { device } from '$lib/store/device';
	import { goto } from '$app/navigation';
	import CharacterWindow from '$lib/components/windows/CharacterWindow.svelte';
	import { windows } from '$lib/store/windows';
	import InventoryWindow from '$lib/components/windows/InventoryWindow.svelte';
	import { disconnectFromServer } from '$lib/api/services/game.service';
	import { addTestItem } from '$lib/store/inventory';

	function openCharacterWindow() {
		windows.openWindow({
			id: 'characterWindow',
			title: 'Character',
			component: CharacterWindow,
			props: {}
		});
		open = false;
	}
	function openInventoryWindow() {
		windows.openWindow({
			id: 'inventoryWindow',
			title: 'Inventory',
			component: InventoryWindow,
			props: {}
		});
		open = false;
	}
	function openSkillsWindow() {}
	function openLeadboardWindow() {
		addTestItem();
	}

	let open = false;

	function logout() {
		disconnectFromServer();
		goto('/account');
	}

	function closeMenu() {
		open = false;
	}

	function openMenu() {
		open = true;
	}
</script>

<div class="open-menu-mobile" class:mobile={$device.isMobile} class:open on:click={openMenu}>
	[menu]
</div>

<div class="game-menu" class:mobile={$device.isMobile} class:open>
	<div class="top-bar">
		<div class="logo">
			<img src={logo} width="64px" height="64px" alt="logo" />
			<span class="text-logo">Void Dungeon</span>
		</div>
		<div class="close" on:click={closeMenu}>[x]</div>
	</div>

	<ul class="actions">
		<li><button on:click={openCharacterWindow}>[CHARACTER]</button></li>
		<li><button on:click={openInventoryWindow}>[INVENTORY]</button></li>
		<li><button on:click={openSkillsWindow}>[SKILLS]</button></li>
		<li><button on:click={openLeadboardWindow}>[LEADBOARD]</button></li>
		<li><button>[GUILD]</button></li>
		<br />
		<li><button class="logout-btn" on:click={logout}>[EXIT]</button></li>
	</ul>
</div>

<style lang="scss">
	.game-menu {
		position: relative;
		display: block;
		width: 256px;
		height: 100%;
		border-left: 1px solid var(--tetriary);
		background: var(--background);
		z-index: var(--zi-desktop-menu);
	}

	.top-bar {
		display: flex;
		padding-top: 30px;
		margin-bottom: 30px;
		gap: 15px;
		align-items: center;
		justify-content: center;

		.logo {
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--secondary);
			font-size: 16px;
			gap: 8px;
			text-decoration: none;
			user-select: none;

			img {
				-webkit-user-drag: none;
			}
		}

		.close {
			display: none;
		}
	}

	.actions {
		list-style: none;
		padding: 15px;
		margin: 0;
		font-size: large;
		text-align: center;

		li {
			margin-bottom: 15px;
		}
	}

	.logout-btn {
		color: rgb(102, 0, 0);
	}

	// mobile

	.open-menu-mobile {
		display: none;
	}

	.open-menu-mobile.mobile {
		display: block;
		position: absolute;
		top: 15px;
		right: 15px;
	}

	.game-menu.mobile {
		position: absolute;
		z-index: var(--zi-mobile-menu);
		width: 100vw;
		height: 100vh;
		border: none;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s;

		&.open {
			opacity: 1;
			pointer-events: all;
		}

		.top-bar .close {
			display: block;
		}
	}
</style>
