<script lang="ts">
	import { goto } from '$app/navigation';
	import HeaderLoggedIn from '$lib/components/home/HeaderLoggedIn.svelte';
	import { onMount } from 'svelte';
	import { jwt, user } from '$lib/store/auth';

	onMount(() => {
		if (!$jwt || !$user) {
			goto('/login');
		}
	});

	let oldPassword: string;
	let newPassword: string;
	let rNewPassword: string;

	async function handleSubmit(event: Event) {
		// event.preventDefault();
		// try {
		// 	const json = await signIn(loginValue, passwordValue);
		// 	jwt.set(json.jwt);
		// 	user.set(json.user);
		// 	goto('/account');
		// } catch (e) {
		// 	errorMessage = 'Failed to login. Try again.';
		// }
	}
</script>

<HeaderLoggedIn />

<main>
	<h2>Settings</h2>

	<form on:submit={handleSubmit}>
		<label for="login-input">Old password:</label><br />
		<input type="text" name="vd-login" id="login-input" bind:value={oldPassword} required />
		<br />
		<label for="password-input">New password:</label><br />
		<input
			type="password"
			name="vd-password"
			id="password-input"
			bind:value={newPassword}
			required
		/>
		<br />
		<label for="r-password-input">Repeat new password:</label><br />
		<input
			type="password"
			name="vd-password"
			id="password-input"
			bind:value={rNewPassword}
			required
		/>
		<br /><br />
		<button type="submit">[CHANGE PASSWORD]</button>
	</form>
</main>

<style>
	main {
		margin-top: 60px;
		animation: fade-in-slide-page 1s ease forwards;
	}

	button {
		margin-top: 30px;
	}
</style>
