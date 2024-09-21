<script lang="ts">
	import { leaveParty, voteNextLevel, exitDungeon, vote } from '$lib/api/services/game.service';
	import {
		party,
		isInParty,
		partySize,
		isVoting,
		voteProgress,
		showVoteFail,
		showVoteSuccess,
		votingTimer,
		startVotingTimer,
		stopVotingTimer,
		type PartyMember
	} from '$lib/store/party';
	import { player } from '$lib/store/player';

	function handleVote() {
		vote();
	}

	function handleLeaveParty() {
		leaveParty();
	}

	$: hasPlayerVoted = $player && $party.votes.includes($player.id);

	function hasMemeberVoted(member: PartyMember) {
		return (
			($isVoting && $player && member.id === $player.id && hasPlayerVoted) ||
			($isVoting && $party.votes.includes(member.id))
		);
	}

	$: {
		if ($party.voting && $party.votingLevel !== null) {
			startVotingTimer();
		} else {
			stopVotingTimer();
		}
	}

	$: showMessage = $showVoteSuccess ? 'SUCCESS' : $showVoteFail ? 'FAILED' : '';
</script>

{#if $isInParty && $player}
	<div class="party-container">
		<span>Party ({$partySize} members)</span>
		<ul>
			{#each $party.members as member}
				<li class={hasMemeberVoted(member) ? 'voted' : ''}>
					{member.id === $player.id ? `${$player.name} (You)` : member.name}
					{#if $isVoting}
						{#if member.id === $player.id}
							{hasPlayerVoted ? '(YES)' : ''}
						{:else}
							{$party.votes.includes(member.id) ? '(YES)' : ''}
						{/if}
					{/if}
				</li>
			{/each}
		</ul>

		{#if $isVoting}
			<div class="voting-section">
				{#if $party.voting === 'enterDungeon'}
					<p>
						Voting to enter dungeon (level: {$party.votingLevel}): {$voteProgress.current}/{$voteProgress.total}
					</p>
				{:else if $party.voting === 'nextLevel'}
					<p>Voting to enter next level: {$voteProgress.current}/{$voteProgress.total}</p>
				{:else if $party.voting === 'exitDungeon'}
					<p>Voting to exit dungeon: {$voteProgress.current}/{$voteProgress.total}</p>
				{/if}
				<p class="timer">Time left: {$votingTimer} seconds</p>
				{#if !hasPlayerVoted}
					<button class="good" on:click={handleVote}>[VOTE]</button>
				{/if}
			</div>
		{/if}

		{#if showMessage}
			<p class="message {showMessage.toLowerCase()}">[VOTE {showMessage}]</p>
		{/if}

		<button class="leave danger" on:click={handleLeaveParty}>[LEAVE]</button>
	</div>
{/if}

<style lang="scss">
	.party-container {
		position: absolute;
		top: 20px;
		right: 20px;
		padding: 10px;
		border: 1px solid var(--tetriary);
		background: var(--background);
		z-index: var(--zi-party-manager);
		user-select: none;
	}

	ul {
		list-style-type: none;
		padding: 0;
	}

	li {
		margin-bottom: 5px;

		&.voted {
			color: var(--poison);
		}
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

	.timer {
		color: var(--warning);
		font-weight: bold;
	}

	.message {
		animation: blink 0.5s step-start infinite;
	}

	.message.success {
		color: var(--poison);
	}

	.message.failed {
		color: var(--hp);
	}

	@keyframes blink {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
