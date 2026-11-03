<script lang="ts">
	import type { PageData } from './$types';
	import { monthLabel } from '#lib/months';

	let { data }: { data: PageData } = $props();

	// Afficher d'abord le mois le plus récent (mois en cours).
	const months = $derived([...data.summary].reverse());
</script>

<div class="space-y-8">
	<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
		<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Rapport flash mensuel</h1>
		<p class="text-slate-600 dark:text-slate-300 leading-relaxed">
			Merci de compléter ce rapport flash chaque mois. L’objectif est de partager de manière transparente les
			actions menées, les actions prévues, les coopérations en cours et les projets qui méritent un échange
			collectif. Les réponses seront centralisées afin de faciliter le suivi, la coordination et la préparation
			des échanges entre les élus.
		</p>
		<a
			href="/rapport"
			class="inline-block mt-4 rounded-lg bg-emerald-700 text-white font-medium px-4 py-2.5 no-underline hover:bg-emerald-800"
		>
			Compléter mon rapport
		</a>
	</section>

	<section>
		<h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Mois récents</h2>
		{#if months.length > 0 && months[0].expected === 0}
			<p class="text-sm text-slate-500 dark:text-slate-400">
				Aucun compte d’élu(e) actif pour le moment. L’administrateur doit d’abord créer les comptes.
			</p>
		{:else}
			<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
				{#each months as entry (entry.month)}
					<div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
						<a href="/mois/{entry.month}" class="font-medium text-slate-800 dark:text-slate-100 no-underline hover:text-emerald-700 dark:text-emerald-400 w-40">
							{monthLabel(entry.month)}
						</a>
						<span
							class="text-sm {entry.submitted >= entry.expected ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}"
						>
							{entry.submitted} / {entry.expected} rapport{entry.expected > 1 ? 's' : ''} remis
						</span>
						<a
							href="/projets?mois={entry.month}"
							class="ml-auto text-sm text-slate-500 dark:text-slate-400 no-underline hover:text-slate-800 dark:hover:text-slate-100 dark:text-slate-100"
						>
							Sujets à aborder en conseil informel →
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
