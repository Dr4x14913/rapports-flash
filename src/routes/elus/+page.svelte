<script lang="ts">
	import type { PageData } from './$types';
	import { monthLabel } from '#lib/months';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-4">
	<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Élu·es</h1>

	<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
		{#each data.members as member (member.slug)}
			<div class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
				<a href="/elus/{member.slug}" class="font-medium text-slate-800 dark:text-slate-100 no-underline hover:text-emerald-700 dark:text-emerald-400">
					{member.full_name}
				</a>
				<span class="text-sm text-slate-500 dark:text-slate-400">
					{#if member.last_month}
						Dernier rapport : {monthLabel(member.last_month)}
					{:else}
						Aucun rapport
					{/if}
				</span>
			</div>
		{:else}
			<p class="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Aucun compte d’élu(e) pour le moment.</p>
		{/each}
	</div>
</div>
