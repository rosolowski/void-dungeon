<script lang="ts">
	import { onMount } from 'svelte';
	import { logOut } from '$lib/api/services/auth.service';
	import { getCharacters } from '$lib/api/services/character-manager.service';
	import Header from '$lib/components/home/Header.svelte';
	import HeaderLoggedIn from '$lib/components/home/HeaderLoggedIn.svelte';
	import { jwt, user } from '$lib/store/auth';
	import logo from '$lib/assets/vd-brand-nobg.png';

	$: loggedIn = $user !== null && $jwt !== null;
	let loaded = false;

	onMount(async () => {
		// check if jwt is still valid
		try {
			await getCharacters();
		} catch (e) {
			logOut();
		}
		loaded = true;
	});
</script>

<svelte:head>
	<title>Void Dungeon</title>
	<meta name="description" content="Embark on an epic dungeon adventure in Void Dungeon" />
</svelte:head>

{#if loggedIn}
	<HeaderLoggedIn />
{:else}
	<Header />
{/if}

<main class="game-homepage" class:loaded>
	<div class="content">
		<img src={logo} alt="Void Dungeon Logo" class="logo" />
		<h1>Void Dungeon</h1>
		<p class="tagline">Dive into the depths. Emerge a legend.</p>
		<div class="cta-buttons">
			{#if loggedIn}
				<a href="/game" class="cta-button primary">Enter the Dungeon</a>
				<a href="/account" class="cta-button secondary">My Account</a>
			{:else}
				<a href="/register" class="cta-button primary">Start Your Adventure</a>
				<a href="/login" class="cta-button secondary">Continue Journey</a>
			{/if}
		</div>
	</div>
	<div class="background-overlay"></div>
</main>

<style lang="scss">
	.game-homepage {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 64px);
		padding: 16px;
		text-align: center;
		position: relative;
		overflow: hidden;

		opacity: 0;
		transition: opacity 1s ease;

		&.loaded {
			opacity: 1;
		}
	}

	.content {
		z-index: 1;
		max-width: 600px;
	}

	.logo {
		width: 256px;
		height: 256px;
		margin-bottom: 16px;
		image-rendering: pixelated;
	}

	h1 {
		font-family: var(--font-mono);
		font-size: 3rem;
		color: var(--special-red);
		margin: 0 0 16px;
	}

	.tagline {
		font-size: 1.2rem;
		color: var(--secondary);
		margin-bottom: 32px;
	}

	.cta-buttons {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.cta-button {
		display: inline-block;
		padding: 12px 24px;
		font-family: var(--font-mono);
		font-size: 1rem;
		text-decoration: none;
		border: 2px solid;
		transition: all var(--primarySpeed) var(--primaryEasingFunction);

		&.primary {
			background-color: var(--special-red);
			color: var(--primary);
			border-color: var(--special-red);

			&:hover {
				background-color: transparent;
				color: var(--special-red);
			}
		}

		&.secondary {
			background-color: transparent;
			color: var(--secondary);
			border-color: var(--secondary);

			&:hover {
				background-color: var(--secondary);
				color: var(--background);
			}
		}
	}

	.background-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(circle, rgba(7, 0, 1, 0.5) 0%, rgba(7, 0, 1, 0.9) 100%);
		z-index: 0;
	}

	@media (min-width: 768px) {
		.cta-buttons {
			flex-direction: row;
			justify-content: center;
		}
	}
</style>
