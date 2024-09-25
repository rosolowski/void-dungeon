<script lang="ts">
	import { onMount } from 'svelte';
	import { logOut } from '$lib/api/services/auth.service';
	import { getCharacters } from '$lib/api/services/character-manager.service';
	import Header from '$lib/components/home/Header.svelte';
	import HeaderLoggedIn from '$lib/components/home/HeaderLoggedIn.svelte';
	import { jwt, user } from '$lib/store/auth';
	import logo from '$lib/assets/vd-brand-nobg.png';
	import bgVideo from '$lib/assets/home/bg-vid.mp4';

	$: loggedIn = $user !== null && $jwt !== null;
	let loaded = false;

	onMount(async () => {
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

<div class="video-background">
	<video autoplay loop muted playsinline>
		<source src={bgVideo} type="video/mp4" />
	</video>
	<div class="video-overlay"></div>
</div>
<main class="game-homepage" class:loaded>
	<div class="content">
		<div class="logo-container">
			<div class="glitch-container">
				<img src={logo} alt="Void Dungeon Logo" class="logo glitch" />
				<img src={logo} alt="Void Dungeon Logo" class="logo glitch" />
				<img src={logo} alt="Void Dungeon Logo" class="logo glitch" />
			</div>
		</div>
		<div class="text-content">
			<p class="tagline">Welcome to</p>
			<h1>Void Dungeon</h1>
		</div>
		<div class="cta-container">
			{#if loggedIn}
				<button on:click={() => (window.location.href = '/dungeon')} class="cta-button primary">
					[ENTER DUNGEON]
				</button>
				<button on:click={() => (window.location.href = '/account')} class="cta-button secondary">
					[ACCOUNT]
				</button>
			{:else}
				<button on:click={() => (window.location.href = '/register')} class="cta-button primary">
					[START ADVENTURE]
				</button>
				<button on:click={() => (window.location.href = '/login')} class="cta-button secondary">
					[CONTINUE]
				</button>
			{/if}
		</div>
	</div>
</main>

<style lang="scss">
	.game-homepage {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 16px;
		position: relative;
		overflow: hidden;
		opacity: 0;
		transition: opacity 1s ease;

		&.loaded {
			opacity: 1;
		}
	}

	.video-background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;

		video {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.video-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--background);
		opacity: 0.6;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 1;
		max-width: 800px;
		width: 100%;
	}

	.logo-container {
		margin-bottom: 4rem;
	}

	.glitch-container {
		position: relative;
		width: 250px;
		height: 250px;
	}

	.logo {
		position: absolute;
		top: 0;
		left: 0;
		width: 256px;
		height: 256px;
		object-fit: contain;
		image-rendering: pixelated;
		filter: drop-shadow(0 0 10px var(--background));

		&.glitch {
			&:nth-child(2) {
				left: 2px;
				animation: glitch 2s infinite;
				animation-delay: 0.1s;
				clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
				opacity: 0.5;
			}

			&:nth-child(3) {
				left: -2px;
				animation: glitch 2s infinite;
				animation-delay: 0.4s;
				clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
				opacity: 0.5;
			}
		}
	}

	@keyframes glitch {
		0% {
			transform: translate(0);
		}
		20% {
			transform: translate(-2px, 2px);
		}
		40% {
			transform: translate(-2px, -2px);
		}
		60% {
			transform: translate(2px, 2px);
		}
		80% {
			transform: translate(2px, -2px);
		}
		100% {
			transform: translate(0);
		}
	}

	.text-content {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-family: var(--font-mono);
		font-size: 3rem;
		color: white;
		margin: 0 0 1rem;
		text-transform: uppercase;
		letter-spacing: 4px;
		text-shadow:
			0 0 2px var(--special-red),
			0 0 20px var(--special-red),
			0 0 80px var(--special-red),
			0 0 120px var(--background);
	}

	.tagline {
		font-size: 1.2rem;
		color: var(--secondary);
		margin: 0;
		margin-bottom: 1rem;
		letter-spacing: 1px;
		text-shadow: 0 0 20px var(--background);
	}

	.cta-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		max-width: 300px;
	}

	.cta-button {
		padding: 1rem;
		font-family: var(--font-mono);
		font-size: 1rem;
		text-align: center;
		text-decoration: none;
		text-transform: uppercase;
		letter-spacing: 2px;
		position: relative;
		overflow: hidden;

		&.primary {
			background-color: var(--special-red);
			color: var(--primary);

			&:hover {
				background-color: var(--hp);
			}
		}

		&.secondary {
			background-color: var(--background);
			color: var(--secondary);
			box-shadow: inset 0 0 0 2px var(--secondary);

			&:hover {
				background-color: var(--secondary);
				color: var(--background);
			}
		}
	}

	@media (min-width: 768px) {
		.cta-container {
			flex-direction: row;
			max-width: 100%;
			justify-content: center;
		}
	}
</style>
