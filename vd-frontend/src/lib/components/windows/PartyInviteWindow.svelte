<script lang="ts">
	import { respondToPartyInvite } from '$lib/api/services/game.service';
	import { createEventDispatcher } from 'svelte';

	export let inviterId: number;
	export let inviterName: string;

	const dispatch = createEventDispatcher();

	function handleAccept() {
		respondToPartyInvite(true, inviterId);
		dispatch('close');
	}

	function handleDecline() {
		respondToPartyInvite(false, inviterId);
		dispatch('close');
	}
</script>

<div class="party-invite-window">
	<div class="main-panel">
		<div class="main-panel-content">
			<div class="title">PARTY INVITATION</div>
			<p>{inviterName} has invited you to join their party!</p>
		</div>
		<div class="main-panel-actions">
			<button class="accept" on:click={handleAccept}>[accept]</button>
			<button class="decline" on:click={handleDecline}>[decline]</button>
		</div>
	</div>
</div>

<style lang="scss">
	.party-invite-window {
		width: 300px;
	}

	.main-panel {
		position: relative;
		padding: 20px;
	}

	.main-panel-content {
		text-align: center;
	}

	.main-panel-actions {
		display: flex;
		justify-content: center;
		gap: 20px;
	}

	.accept {
		color: var(--poison);
	}

	.decline {
		color: var(--hp);
	}
</style>
