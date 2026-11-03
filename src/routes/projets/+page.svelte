<script lang="ts">
	import type { PageData } from './$types';
	import { monthLabel } from '#lib/months';
	import { sanitizeHtml } from '#lib/sanitize';

	let { data }: { data: PageData } = $props();
	// svelte-ignore state_referenced_locally -- réinitialisé manuellement à la navigation
	let mois = $state(data.month);
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-end gap-4">
		<div>
			<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Sujets à aborder en conseil informel</h1>
		</div>
		<div class="ml-auto flex items-center gap-2">
			<label for="mois" class="text-sm text-slate-600 dark:text-slate-300">Mois</label>
			<select
				id="mois"
				bind:value={mois}
				onchange={() => window.location.assign(`/projets?mois=${mois}`)}
				class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
			>
				{#each data.months as month (month)}
					<option value={month}>{monthLabel(month)}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if data.projects.length === 0}
		<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-slate-500 dark:text-slate-400">
			Aucun projet déclaré pour {monthLabel(data.month).toLowerCase()}.
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.projects as project (project.id)}
				<article class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
					<a href="/elus/{project.slug}" class="font-semibold text-slate-800 dark:text-slate-100 no-underline hover:text-emerald-700 dark:text-emerald-400">
						{project.full_name}
					</a>
					<div class="rte mt-2 text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
						{@html sanitizeHtml(project.projects)}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>
