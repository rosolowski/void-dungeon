<script lang="ts">
	import { player } from '$lib/store/player';
	import { dungeonProgress } from '$lib/store/dungeon-progress';
	import { isInParty, party, isVoting, votingTimer } from '$lib/store/party';
	import { enterDungeon, initiateVote, vote } from '$lib/api/services/game.service';
	import { onDestroy } from 'svelte';

	let selectedLevel = 1;
	let votingTimeout: number;

	$: maxLevel = $dungeonProgress?.maxReachedLevel || 1;
	$: votingLevel = $party.votingLevel;

	function handleEnterDungeon() {
		if ($isInParty) {
			if ($isVoting) {
				vote();
			} else {
				initiateVote('enterDungeon', selectedLevel);
			}
		} else {
			initiateVote('enterDungeon', selectedLevel);
		}
	}

	function handleLevelChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedLevel = parseInt(target.value, 10);
	}

	function handleVote() {
		vote();
	}

	onDestroy(() => {
		if (votingTimeout) {
			clearTimeout(votingTimeout);
		}
	});
</script>

<div class="portal-window">
	<div class="main-panel">
		<div class="main-panel-content">
			<div class="title">DUNGEON PORTAL</div>
			<p>Unlocked levels:</p>
			<p>1 - {maxLevel}</p>
			{#if !$isVoting}
				<select bind:value={selectedLevel} on:change={handleLevelChange} disabled={$isVoting}>
					{#each Array(maxLevel) as _, i}
						<option value={i + 1}>Level {i + 1}</option>
					{/each}
				</select>
			{/if}

			{#if $isVoting}
				<div>Voting to enter level {votingLevel}</div>
				<div class="timer">Time left: {$votingTimer} seconds</div>
				<div>Votes: {$party.votes.length}/{$party.members.length}</div>
			{/if}
			<button class={$isVoting ? 'good' : ''} on:click={handleEnterDungeon} disabled={$isVoting}>
				{#if $isInParty}
					{#if $isVoting && $player && !$party.votes.includes($player.id)}
						[VOTE YES]
					{:else if $isVoting}
						VOTED! Waiting...
					{:else}
						[VOTE ENTER]
					{/if}
				{:else}
					[ENTER]
				{/if}
			</button>
		</div>
	</div>
</div>

<style lang="scss">
	.portal-window {
		width: 300px;
		height: auto;
		color: var(--primary);
		padding: 20px;

		.main-panel {
			.title {
				font-size: 1.5em;
				font-weight: 600;
				color: var(--secondary);
				margin-bottom: 30px;
				text-align: center;
			}

			p {
				margin: 10px 0;
				text-align: center;
			}

			select {
				padding: 5px;
				border: 1px solid var(--secondary);
				background: var(--background);
				color: var(--primary);
				margin-top: 30px;

				&:disabled {
					background: var(--tetriary);
					color: var(--secondary);
				}
			}

			button {
				font-size: 16px;
			}
		}
	}
</style>
