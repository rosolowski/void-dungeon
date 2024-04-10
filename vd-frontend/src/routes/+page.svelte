<script lang="ts">
	import { logOut } from '$lib/api/services/auth.service';
	import { getCharacters } from '$lib/api/services/character-manager.service';
	import Header from '$lib/components/home/Header.svelte';
	import HeaderLoggedIn from '$lib/components/home/HeaderLoggedIn.svelte';
	import { jwt, user } from '$lib/store/auth';
	import { onMount } from 'svelte';

	$: loggedIn = $user !== null && $jwt !== null;

	onMount(async () => {
		// check if jwt is still valid
		try {
			await getCharacters();
		} catch (e) {
			logOut();
		}
	});
</script>

<svelte:head>
	<title>Void Dungeon</title>
	<meta name="description" content="Awesome roguelike multiplayer dungeon crawler" />
</svelte:head>

{#if loggedIn}
	<HeaderLoggedIn />
{:else}
	<Header />
{/if}

<main class="game-homepage">
	<section class="intro">
		<h1>Welcome to Void Dungeon</h1>
		<p>
			Embark on an epic dungeon adventure with friends in a world where strategy, skill, and fortune
			shape your destiny. Dive into the depths and emerge a legend!
		</p>
	</section>

	<section class="game-story">
		<h2>The Adventure Awaits</h2>
		<p>
			Discover a land filled with ancient mysteries, uncharted territories, and untold treasures.
			Each journey into the dungeon is unique, challenging you with new environments and unforeseen
			dangers.
		</p>
	</section>

	<section class="features">
		<h2>Game Features</h2>
		<ul>
			<li>Retro-inspired pixel art graphics with a modern twist.</li>
			<li>Dynamic dungeons that challenge your strategy at every turn.</li>
			<li>Cooperative gameplay: team up and face the unknown together.</li>
			<li>Roguelite elements: experiment with different skills on each floor.</li>
			<li>Progressive difficulty: the deeper you go, the harder it gets.</li>
			<li>Keep your hard-earned gear, experience, and treasures, even after defeat.</li>
		</ul>
	</section>

	<section class="gameplay">
		<h2>Gameplay Mechanics</h2>
		<p>
			Master a unique blend of tactical combat and skill-based progression. Choose your path wisely,
			adapt to your surroundings, and overcome the odds with smart decision-making.
		</p>
	</section>

	<section class="call-to-action">
		<h2>Join the Quest</h2>
		<button class="start-button">[ START YOUR ADVENTURE ]</button>
	</section>

	<section class="testimonials">
		<h2>What Players Say</h2>
		<div class="testimonial">
			<p>"An unforgettable journey! The thrill of the unknown keeps me coming back for more."</p>
			<span>- Player One</span>
		</div>
		<div class="testimonial">
			<p>
				"The perfect blend of challenge and fun. It's not just about fighting; it's about
				strategizing."
			</p>
			<span>- Player Two</span>
		</div>
		<!-- More testimonials -->
	</section>

	<section class="social-media">
		<h2>Connect With Us</h2>
		<!-- Social media links or widgets -->
	</section>
</main>

<style>
	section {
		border-bottom: 1px solid var(--tetriary);
	}

	.game-homepage {
		color: var(--primary);
		text-align: center;
	}

	.game-homepage h1,
	.game-homepage h2 {
		font-family: var(--font-mono);
		color: var(--special-red);
	}

	.game-homepage p {
		color: var(--secondary);
	}

	.game-homepage section {
		padding: 4rem 0;
	}

	.game-homepage .features,
	.game-homepage .gameplay {
		text-align: left;
	}

	.game-homepage ul {
		list-style: none;
		padding: 0;
	}

	.game-homepage ul li {
		margin-bottom: 0.5rem;
		position: relative;
		padding-left: 1.5em;
	}

	.game-homepage ul li:before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--special-red);
	}

	.game-homepage .start-button {
		background-color: var(--tetriary);
		color: var(--secondary);
		padding: 10px 20px;
		font-size: 1rem;
		font-weight: bold;
	}

	.game-homepage .start-button:hover {
		background-color: var(--primary);
		color: var(--special-red);
	}

	.game-homepage .testimonial {
		background-color: var(--tetriary);
		padding: 1rem;
		border-radius: 5px;
		margin-bottom: 1rem;
	}

	.game-homepage .testimonial p {
		font-style: italic;
	}

	.game-homepage .testimonial span {
		display: block;
		text-align: right;
		margin-top: 1rem;
		color: var(--primary);
	}
</style>
