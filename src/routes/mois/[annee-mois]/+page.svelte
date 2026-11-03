<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, monthLabel } from '#lib/months';
	import ReportBody from '#lib/components/ReportBody.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
		<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Rapports de {monthLabel(data.month).toLowerCase()}</h1>
		<a href="/projets?mois={data.month}" class="text-sm text-emerald-700 dark:text-emerald-400 no-underline hover:underline">
			Sujets à aborder en conseil informel →
		</a>
	</div>

	{#if data.reports.length === 0 && data.missing.length === 0}
		<p class="text-slate-500 dark:text-slate-400">Aucun compte d’élu(e) actif pour le moment.</p>
	{/if}

	<div class="grid gap-4 md:grid-cols-2">
		{#each data.reports as report (report.id)}
			<article class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
				<div class="flex items-baseline justify-between gap-2 mb-3">
					<a href="/elus/{report.slug}" class="font-semibold text-slate-800 dark:text-slate-100 no-underline hover:text-emerald-700 dark:text-emerald-400">
						{report.full_name}
					</a>
					<span class="text-xs text-slate-400 dark:text-slate-500 shrink-0">remis le {formatDate(report.updated_at)}</span>
				</div>
				<ReportBody report={report} />
			</article>
		{/each}

		{#each data.missing as member (member.slug)}
			<article class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-5 opacity-70">
				<div class="flex items-baseline justify-between gap-2 mb-1">
					<a href="/elus/{member.slug}" class="font-semibold text-slate-500 dark:text-slate-400 no-underline hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-200">
						{member.full_name}
					</a>
					<span class="text-xs text-slate-400 dark:text-slate-500">non remis</span>
				</div>
			</article>
		{/each}
	</div>
</div>

