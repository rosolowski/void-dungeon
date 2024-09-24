<script>
	import logo from '$lib/assets/vd-logo.png';

	let isMenuOpen = false;

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<header>
	<div class="header-content">
		<a class="logo" href="/">
			<img src={logo} width="64px" height="64px" alt="logo" />
			<span class="text-logo">Void Dungeon</span>
		</a>
		<div class="mobile-menu-container">
			<button class="mobile-nav-btn" on:click={toggleMenu}>
				{#if isMenuOpen}
					[close]
				{:else}
					[menu]
				{/if}
			</button>
		</div>
		<div class="desktop-menu-container">
			<nav>
				<a class="navlink" href="/">Home</a>
				<a class="navlink" href="/">About</a>
				<a class="navlink" href="/register">Register</a>
				<a class="navlink" href="/login">Login</a>
			</nav>
		</div>
	</div>
</header>

<div class="mobile-menu-overlay" class:open={isMenuOpen}>
	<nav>
		<a class="navlink" href="/">Home</a>
		<a class="navlink" href="/">About</a>
		<a class="navlink" href="/register">Register</a>
		<a class="navlink" href="/login">Login</a>
	</nav>
</div>

<style lang="scss">
	header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		background: linear-gradient(to bottom, var(--background) 30%, transparent);
		z-index: 1000;
		height: 64px;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		height: 64px;
		max-width: 800px;
		margin: auto;
	}

	.mobile-menu-container {
		display: flex;
		align-items: center;
		padding: 16px;
		z-index: 1000;
	}

	.mobile-menu-overlay {
		pointer-events: none;
		opacity: 0;
		display: block;
		z-index: 999;
		position: fixed;
		top: -50px;
		left: 0;
		width: 100vw;
		height: 100vh;
		padding-top: 64px;

		transition:
			opacity 0.15s,
			top 0.15s;

		background-color: var(--background);

		&.open {
			pointer-events: all;
			opacity: 1;
			top: 0;
		}

		nav {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 16px;
			margin-top: 16px;
		}
	}

	.logo {
		display: flex;
		align-items: center;
		text-decoration: none;
		gap: 8px;
		padding-left: 8px;

		img {
			height: 100%;
			image-rendering: crisp-edges;
		}
		.text-logo {
			color: var(--secondary);
			font-size: 16px;
		}
	}

	.desktop-menu-container {
		display: none;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		justify-content: center;

		nav {
			display: flex;
			gap: 16px;
		}
	}

	@media (min-width: 1024px) {
		.logo {
			gap: 8px;
			.text-logo {
				font-size: 24px;
			}
		}

		.mobile-menu-container {
			display: none;
		}

		.mobile-menu-overlay.open {
			display: none;
		}

		.desktop-menu-container {
			display: flex;
		}
	}
</style>
