<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import { monthLabel } from '#lib/months';
	import ReportForm from '#lib/components/ReportForm.svelte';
	import ReportBody from '#lib/components/ReportBody.svelte';

	let { data }: { data: PageData } = $props();
	const form = $derived(page.form);
</script>

{#if data.sent}
	<div class="max-w-lg mx-auto mt-10">
		<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-800 p-6 text-center">
			<div class="text-3xl mb-2">✓</div>
			<h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
				Merci. Votre rapport flash a bien été enregistré et partagé.
			</h1>
			<div class="flex flex-col gap-2">
				<a
					href="/mois/{data.month}"
					class="rounded-lg bg-emerald-700 text-white font-medium px-4 py-2.5 no-underline hover:bg-emerald-800"
				>
					Voir la vue du mois
				</a>
				<a
					href="/elus/{data.user.slug}"
					class="rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium px-4 py-2.5 no-underline hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
				>
					Mon historique
				</a>
				<a href="/" class="text-sm text-slate-500 dark:text-slate-400 no-underline hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100">Retour à l’accueil</a>
			</div>
		</div>
	</div>
{:else}
	<div class="space-y-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Rapport flash — {monthLabel(data.month)}</h1>
		</div>

		{#if data.tooOld}
			<div class="rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm px-4 py-3">
				Ce rapport est trop ancien, il ne peut plus être modifié.
			</div>
			{#if data.existing}
				<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
					<ReportBody report={data.existing} />
				</div>
			{:else}
				<p class="text-sm text-slate-500 dark:text-slate-400">Aucun rapport n'a été enregistré pour ce mois.</p>
			{/if}
		{:else}
			<ReportForm
				user={data.user}
				initialMonth={data.month}
				existing={data.existing}
				formValues={form?.values ?? null}
				formError={form?.error ?? null}
			/>
		{/if}
	</div>
{/if}
