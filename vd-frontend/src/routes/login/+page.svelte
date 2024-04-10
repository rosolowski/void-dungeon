<script lang="ts">
	import Header from '$lib/components/home/Header.svelte';
	import { jwt, user } from '$lib/store/auth';
	import { goto } from '$app/navigation';
	import { signIn } from '$lib/api/services/auth.service';
	import { onMount } from 'svelte';

	let loginValue: string;
	let passwordValue: string;

	let errorMessage: string = '';

	onMount(() => {
		if ($jwt && $user) {
			goto('/account');
		}
	});

	async function login() {
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
	<p class="error-message">{errorMessage}</p>
	<label for="login-input">Login:</label><br />
	<input type="text" name="vd-login" id="login-input" bind:value={loginValue} />
	<br />
	<label for="password-input">Password:</label><br />
	<input type="password" name="vd-password" id="password-input" bind:value={passwordValue} />
	<br /><br />
	<button on:click={login}>[login]</button>
</main>

<style lang="scss">
	.error-message {
		color: red;
	}
</style>
