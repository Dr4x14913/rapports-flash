<script lang="ts">
	import type { Report } from '#lib/types';
	import { sanitizeHtml } from '#lib/sanitize';

	let { report }: { report: Report } = $props();

	const sections = $derived(
		[
			{ title: 'Actions menées', value: report.actions_done },
			{ title: 'Actions et réunions à venir', value: report.actions_planned },
			{ title: 'Coopérations et travail collectif', value: report.cooperation },
			{ title: 'Sujets à aborder en conseil informel', value: report.projects }
		].filter((section) => Boolean(section.value))
	);
</script>

<div>
	{#each sections as section, index (section.title)}
		<!-- Ligne de séparation entre sections : le contenu riche pouvant
			contenir ses propres titres (h2/h3), il faut un repère clair. -->
		<div class={index > 0 ? 'mt-5 pt-4 border-t border-slate-200 dark:border-slate-700' : ''}>
			<h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">{section.title}</h3>
			<!-- div plutôt que p : le contenu riche peut contenir des blocs (listes) -->
			<div class="rte text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
				{@html sanitizeHtml(section.value)}
			</div>
		</div>
	{/each}
</div>
