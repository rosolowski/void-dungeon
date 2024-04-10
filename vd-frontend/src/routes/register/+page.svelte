<script lang="ts">
	import Header from '$lib/components/home/Header.svelte';
	import { jwt, user } from '$lib/store/auth';
	import { goto } from '$app/navigation';
	import { register } from '$lib/api/services/auth.service';
	import { onMount } from 'svelte';

	let loginValue: string;
	let emailValue: string;
	let passwordValue: string;
	let rPasswordValue: string;

	let errorMessages: string[] = [];
	let successMessage: string = '';

	onMount(() => {
		if ($jwt && $user) {
			goto('/account');
		}
	});

	async function registerHandler() {
		if (passwordValue !== rPasswordValue) {
			errorMessages = ['Passwords do not match!'];
			return;
		}
		try {
			const json = await register(emailValue, loginValue, passwordValue);
			errorMessages = [];
			successMessage = json.message;
		} catch (e: any) {
			errorMessages = e.message;
			console.log('errorMessages', errorMessages);
		}
	}
</script>

<Header />

<main>
	<h2>Login</h2>
	{#each errorMessages as errorMessage}
		<p class="error-message">{errorMessage}</p>
	{/each}
	{#if successMessage}
		<p class="success-message">{successMessage}</p>
	{/if}

	<label for="login-input">E-mail:</label><br />
	<input type="text" name="vd-email" id="email-input" bind:value={emailValue} />
	<br />
	<label for="login-input">Login:</label><br />
	<input type="text" name="vd-login" id="login-input" bind:value={loginValue} />
	<br />
	<label for="password-input">Password:</label><br />
	<input type="password" name="vd-password" id="password-input" bind:value={passwordValue} />
	<br />
	<label for="r-password-input">Repeat password:</label><br />
	<input type="password" name="vd-r-password" id="r-password-input" bind:value={rPasswordValue} />
	<br /><br />
	<button on:click={registerHandler}>[register]</button>
</main>

<style lang="scss">
	.error-message {
		color: red;
	}

	.success-message {
		color: green;
	}
</style>
