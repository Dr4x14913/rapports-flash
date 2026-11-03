<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, monthLabel, monthNames, shiftMonth, currentMonth, isTooOldToEdit } from '#lib/months';

	let { data }: { data: PageData } = $props();

	const now = new Date();
	let chosenMonth = $state(now.getMonth() + 1);
	let chosenYear = $state(now.getFullYear());

	// Les rapports de plus de 3 mois ne peuvent plus être créés ni modifiés :
	// on retire du menu les mois trop anciens pour l'année choisie.
	const oldestEditableMonth = shiftMonth(currentMonth(), -3);
	const selectableMonths = $derived(
		monthNames()
			.map((name, index) => ({ name, value: index + 1 }))
			.filter(({ value }) => `${chosenYear}-${String(value).padStart(2, '0')}` >= oldestEditableMonth)
	);

	$effect(() => {
		if (!selectableMonths.some(({ value }) => value === chosenMonth) && selectableMonths.length > 0) {
			chosenMonth = selectableMonths[selectableMonths.length - 1].value;
		}
	});
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Mon rapport flash</h1>
		<p class="text-sm text-slate-500 dark:text-slate-400">Choisissez un mois pour écrire votre rapport, ou modifiez un rapport existant.</p>
	</div>

	<!-- Choix du mois -->
	<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
		<h2 class="font-semibold text-slate-800 dark:text-slate-100 mb-1">Écrire un rapport</h2>
		<p class="text-sm text-slate-500 dark:text-slate-400 mb-3">
			Les rapports plus anciens que 3 mois ne peuvent pas être créés ni modifiés.
		</p>
		<form method="get" action="/rapport" class="flex flex-wrap items-end gap-3">
			<div>
				<label for="mois" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Mois</label>
				<select
					id="mois"
					name="mois"
					bind:value={chosenMonth}
					class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
				>
					{#each selectableMonths as { name, value } (value)}
						<option {value}>{name}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="annee" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Année</label>
				<input
					id="annee"
					name="annee"
					type="number"
					min={data.minYear}
					max={data.maxYear}
					bind:value={chosenYear}
					required
					class="w-28 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
				/>
			</div>
			<button
				type="submit"
				disabled={selectableMonths.length === 0}
				class="rounded-lg bg-emerald-700 text-white font-medium px-5 py-2 hover:bg-emerald-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
			>
				Écrire le rapport
			</button>
		</form>
		{#if selectableMonths.length === 0}
			<p class="text-sm text-red-600 dark:text-red-400 mt-2">
				Aucun mois de {chosenYear} n'est encore modifiable (rapports de plus de 3 mois fermés).
			</p>
		{/if}
	</section>

	<!-- Rapports déjà écrits -->
	<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
		<h2 class="font-semibold text-slate-800 dark:text-slate-100 mb-1">Mes rapports</h2>
		{#if data.myReports.length === 0}
			<p class="px-4 py-6 text-sm text-slate-500 dark:text-slate-400 text-center">
				Vous n’avez pas encore écrit de rapport.
			</p>
		{:else}
			<div class="rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
				{#each data.myReports as report (report.id)}
					<div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
						<a
							href="/rapport/{report.month}"
							class="font-medium text-slate-800 dark:text-slate-100 no-underline hover:text-emerald-700 dark:text-emerald-400 w-40"
						>
							{monthLabel(report.month)}
						</a>
						<span class="text-sm text-slate-500 dark:text-slate-400">mis à jour le {formatDate(report.updated_at)}</span>
						<a
							href="/rapport/{report.month}"
							class="ml-auto text-sm text-emerald-700 dark:text-emerald-400 no-underline hover:text-emerald-800 dark:hover:text-emerald-200 dark:text-emerald-200"
						>
							{isTooOldToEdit(report.month) ? 'Voir →' : 'Modifier →'}
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
