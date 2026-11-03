<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let email = $state('');
	let password = $state('');
	const form = $derived(page.form);
</script>

<div class="max-w-sm mx-auto mt-12">
	<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
		<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">Connexion</h1>
		<p class="text-sm text-slate-500 dark:text-slate-400 mb-5">
			Rapports flash des élus — espace réservé au groupe.
		</p>

		{#if form?.error}
			<div class="mb-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-3 py-2">
				{form.error}
			</div>
		{/if}

		<form method="post" class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">E-mail</label>
				<input
					id="email"
					name="email"
					type="email"
					bind:value={email}
					autocomplete="email"
					required
					class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
				/>
			</div>
			<div>
				<label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Mot de passe</label>
				<input
					id="password"
					name="password"
					type="password"
					bind:value={password}
					autocomplete="current-password"
					required
					class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
				/>
			</div>
			<button
				type="submit"
				class="w-full rounded-lg bg-emerald-700 text-white font-medium px-4 py-2.5 hover:bg-emerald-800 cursor-pointer"
			>
				Se connecter
			</button>
		</form>
	</div>
</div>
