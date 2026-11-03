<script lang="ts">
	import { page } from '$app/state';

	const form = $derived(page.form);

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
</script>

<div class="max-w-sm mx-auto mt-6">
	<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
		<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1">Mon compte</h1>
		<p class="text-sm text-slate-500 dark:text-slate-400 mb-5">Changer votre mot de passe.</p>

		{#if form?.error}
			<div class="mb-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-3 py-2">
				{form.error}
			</div>
		{/if}
		{#if form?.success}
			<div class="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm px-3 py-2">
				Mot de passe mis à jour.
			</div>
		{/if}

		<form method="post" class="space-y-4">
			<div>
				<label for="current_password" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
					Mot de passe actuel
				</label>
				<input
					id="current_password"
					name="current_password"
					type="password"
					bind:value={currentPassword}
					autocomplete="current-password"
					required
					class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
				/>
			</div>
			<div>
				<label for="new_password" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
					Nouveau mot de passe
				</label>
				<input
					id="new_password"
					name="new_password"
					type="password"
					bind:value={newPassword}
					autocomplete="new-password"
					minlength="8"
					required
					class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
				/>
			</div>
			<div>
				<label for="confirm_password" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
					Confirmer le nouveau mot de passe
				</label>
				<input
					id="confirm_password"
					name="confirm_password"
					type="password"
					bind:value={confirmPassword}
					autocomplete="new-password"
					minlength="8"
					required
					class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
				/>
			</div>
			<button
				type="submit"
				class="w-full rounded-lg bg-emerald-700 text-white font-medium px-4 py-2.5 hover:bg-emerald-800 cursor-pointer"
			>
				Mettre à jour le mot de passe
			</button>
		</form>
	</div>
</div>
