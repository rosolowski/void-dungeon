<script lang="ts">
	import { leaveParty, voteNextLevel, exitDungeon } from '$lib/api/services/game.service';
	import { party, isInParty, partySize, isVoting, voteProgress } from '$lib/store/party';
	import { player } from '$lib/store/player';

	function handleVote() {
		voteNextLevel();
	}

	function handleLeaveParty() {
		leaveParty();
	}

	function handleExitDungeon() {
		exitDungeon();
	}
</script>

{#if $isInParty && $player}
	<div class="party-container">
		<span>Party ({$partySize} members)</span>
		<ul>
			{#each $party.members as member}
				{#if member.id !== $player.id}
					<li>{member.name}</li>
				{:else}
					<li>{$player.name} (You)</li>
				{/if}
			{/each}
		</ul>

		{#if $isVoting}
			<div class="voting-section">
				<p>Vote in progress: {$voteProgress.current}/{$voteProgress.total}</p>
				{#if $party.voting === 'nextLevel'}
					<button class="vote" on:click={handleVote}>[VOTE NEXT LEVEL]</button>
				{:else if $party.voting === 'quit'}
					<button class="vote" on:click={handleExitDungeon}>[VOTE EXIT]</button>
				{/if}
			</div>
		{/if}

		<button class="leave" on:click={handleLeaveParty}>[LEAVE]</button>
	</div>
{/if}

<style>
	.party-container {
		position: absolute;
		top: 20px;
		right: 20px;
		padding: 10px;
		border: 1px solid var(--tetriary);
		background: var(--background);
		z-index: var(--zi-party-manager);
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		margin-bottom: 5px;
	}

	.voting-section {
		margin-top: 10px;
	}

	button {
		margin-top: 10px;
	}

	.leave {
		color: var(--hp);
	}

	.vote {
		color: var(--poison);
	}
</style>
