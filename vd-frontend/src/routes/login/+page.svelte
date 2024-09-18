<script lang="ts">
	import Header from '$lib/components/home/Header.svelte';
	import { jwt, user } from '$lib/store/auth';
	import { goto } from '$app/navigation';
	import { signIn } from '$lib/api/services/auth.service';
	import { onMount } from 'svelte';

	let loginValue: string = '';
	let passwordValue: string = '';

	let errorMessage: string = '';

	onMount(() => {
		if ($jwt && $user) {
			goto('/account');
		}
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		try {
			const json = await signIn(loginValue, passwordValue);
			jwt.set(json.jwt);
			user.set(json.user);
			goto('/account');
		} catch (e) {
			errorMessage = 'Failed to login. Try again.';
		}
	}
</script>

<Header />

<main>
	<h2>Login</h2>
	{#if errorMessage}
		<p class="error-message">{errorMessage}</p>
	{/if}

	<form on:submit={handleSubmit}>
		<label for="login-input">Login:</label><br />
		<input type="text" name="vd-login" id="login-input" bind:value={loginValue} required />
		<br />
		<label for="password-input">Password:</label><br />
		<input
			type="password"
			name="vd-password"
			id="password-input"
			bind:value={passwordValue}
			required
		/>
		<br /><br />
		<button type="submit">[login]</button>
	</form>
</main>

<style lang="scss">
	main {
		animation: fade-in-page 1s ease;
	}

	.error-message {
		color: var(--special-red);
	}

	form {
		margin-top: 20px;
	}

	input {
		margin-bottom: 10px;
		width: 100%;
		max-width: 300px;
	}

	button {
		font-family: var(--font-mono);
	}
</style>
