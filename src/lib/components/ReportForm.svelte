<script lang="ts">
	import { untrack } from 'svelte';
	import type { PublicUser, Report } from '#lib/types';
	import { monthLabel } from '#lib/months';
	import { htmlToText } from '#lib/sanitize';
	import MicButton from './MicButton.svelte';

	interface Props {
		user: PublicUser;
		initialMonth: string;
		existing: Report | undefined;
		formValues: Record<string, string> | null;
		formError: string | null;
	}

	let { user, initialMonth, existing, formValues, formError }: Props = $props();

	const MAX = 5000;

	// svelte-ignore state_referenced_locally -- état volontairement initialisé une seule fois
	let mois = $state(initialMonth);
	// svelte-ignore state_referenced_locally
	let actionsMenes = $state(htmlToText(existing?.actions_done ?? ''));
	// svelte-ignore state_referenced_locally
	let actionsPrevues = $state(htmlToText(existing?.actions_planned ?? ''));
	// svelte-ignore state_referenced_locally
	let cooperations = $state(htmlToText(existing?.cooperation ?? ''));
	// svelte-ignore state_referenced_locally
	let projets = $state(htmlToText(existing?.projects ?? ''));

	// Ré-initialise le formulaire quand le mois cible change (navigation),
	// sans toucher aux textes tapés après une erreur de validation.
	$effect(() => {
		const month = initialMonth;
		mois = month;
		untrack(() => {
			const ex = existing;
			actionsMenes = htmlToText(ex?.actions_done ?? '');
			actionsPrevues = htmlToText(ex?.actions_planned ?? '');
			cooperations = htmlToText(ex?.cooperation ?? '');
			projets = htmlToText(ex?.projects ?? '');
		});
	});

	function count(value: string): string {
		return `${value.length.toLocaleString('fr-FR')} / ${MAX.toLocaleString('fr-FR')}`;
	}

	function appendDictated(current: string, text: string): string {
		const trimmed = current.trim();
		if (!trimmed) return text;
		return `${trimmed}\n${text}`;
	}
</script>

<form method="post" class="space-y-6">
	<input type="hidden" name="mois" value={mois} />

	{#if formError}
		<div class="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3">{formError}</div>
	{/if}

	<!-- 2. Actions menées -->
	<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
		<div class="flex items-start justify-between gap-2 mb-1">
			<label for="actions_menes" class="block font-medium text-slate-800 dark:text-slate-100">
				Mes principales actions menées depuis le dernier rapport flash <span class="text-red-600 dark:text-red-400">*</span>
			</label>
			<MicButton onResult={(text) => (actionsMenes = appendDictated(actionsMenes, text))} />
		</div>
		<p class="text-sm text-slate-500 dark:text-slate-400 mb-2">Indiquez une action par ligne.</p>
		<textarea
			id="actions_menes"
			name="actions_menes"
			bind:value={actionsMenes}
			rows={6}
			placeholder="Vous pouvez indiquer une action par ligne et préciser les résultats obtenus."
			class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
		></textarea>
		<p class="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">{count(actionsMenes)}</p>
	</section>

	<!-- 3. Actions et réunions à venir -->
	<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
		<div class="flex items-start justify-between gap-2 mb-1">
			<label for="actions_prevues" class="block font-medium text-slate-800 dark:text-slate-100">
				Mes principales actions et réunions prévues dans le mois à venir <span class="text-red-600 dark:text-red-400">*</span>
			</label>
			<MicButton onResult={(text) => (actionsPrevues = appendDictated(actionsPrevues, text))} />
		</div>
		<p class="text-sm text-slate-500 dark:text-slate-400 mb-2">Indiquez les actions, réunions et échéances prévues. Indiquez une action par ligne.</p>
		<textarea
			id="actions_prevues"
			name="actions_prevues"
			bind:value={actionsPrevues}
			rows={5}
			placeholder="Actions, réunions et échéances prévues."
			class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
		></textarea>
		<p class="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">{count(actionsPrevues)}</p>
	</section>

	<!-- 4. Coopérations et travail collectif -->
	<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
		<div class="flex items-start justify-between gap-2 mb-1">
			<label for="cooperations" class="block font-medium text-slate-800 dark:text-slate-100">
				Les élus, citoyens-partenaires et citoyens avec lesquels je travaille
			</label>
			<MicButton onResult={(text) => (cooperations = appendDictated(cooperations, text))} />
		</div>
		<p class="text-sm text-slate-500 dark:text-slate-400 mb-2">
			Indiquez les personnes ou groupes concernés, les sujets abordés, les coopérations en cours et les
			contributions de chacun. Indiquez un sujet par ligne.
		</p>
		<textarea
			id="cooperations"
			name="cooperations"
			bind:value={cooperations}
			rows={5}
			placeholder="Personnes ou groupes concernés, sujets abordés, contributions de chacun."
			class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
		></textarea>
		<p class="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">{count(cooperations)}</p>
	</section>

	<!-- 5. Sujets à aborder en conseil informel -->
	<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
		<div class="flex items-start justify-between gap-2 mb-1">
			<label for="projets" class="block font-medium text-slate-800 dark:text-slate-100">
				Les sujets que je souhaite débattre en Conseil informel
			</label>
			<MicButton onResult={(text) => (projets = appendDictated(projets, text))} />
		</div>
		<p class="text-sm text-slate-500 dark:text-slate-400 mb-2">
			Présentez le sujet, son contexte, les points à discuter et, le cas échéant, la décision attendue.
			Mettre un sujet par ligne.
		</p>
		<textarea
			id="projets"
			name="projets"
			bind:value={projets}
			rows={5}
			placeholder="Présentez le sujet, son contexte et la décision attendue."
			class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
		></textarea>
		<p class="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">{count(projets)}</p>
	</section>

	<div class="flex justify-end gap-3">
		<a
			href="/rapport"
			class="rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium px-6 py-2.5 no-underline hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
		>
			Annuler
		</a>
		<button
			type="submit"
			class="rounded-lg bg-brand-700 text-white font-medium px-6 py-2.5 hover:bg-brand-800 cursor-pointer"
		>
			{existing ? 'Mettre à jour mon rapport' : 'Enregistrer mon rapport'}
		</button>
	</div>
</form>
