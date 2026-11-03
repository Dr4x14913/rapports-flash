<script lang="ts">
	import type { PageData } from './$types';
	import { formatDate, monthLabel } from '#lib/months';
	import ReportBody from '#lib/components/ReportBody.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">{data.member.full_name}</h1>
		<p class="text-sm text-slate-500 dark:text-slate-400">{data.reports.length} rapport{data.reports.length > 1 ? 's' : ''} remis</p>
	</div>

	{#if data.reports.length === 0}
		<p class="text-slate-500 dark:text-slate-400">Aucun rapport pour le moment.</p>
	{:else}
		<div class="space-y-4">
			{#each data.reports as report (report.id)}
				<article class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
					<div class="flex items-baseline justify-between gap-2 mb-3">
						<h2 class="font-semibold text-slate-800 dark:text-slate-100">{monthLabel(report.month)}</h2>
						<span class="text-xs text-slate-400 dark:text-slate-500">modifié le {formatDate(report.updated_at)}</span>
					</div>
					<ReportBody report={report} />
				</article>
			{/each}
		</div>
	{/if}
</div>
