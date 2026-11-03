<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
import ThemeToggle from '#lib/components/ThemeToggle.svelte';

	let { children } = $props();
	const user = $derived(page.data.user);

	// Menu mobile (nom / thème / déconnexion) — invisible sur grand écran.
	let mobileMenuOpen = $state(false);
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<script>
		// Applique le thème avant le premier rendu pour éviter le flash.
		(function () {
			try {
				const stored = localStorage.getItem('theme');
				const dark = stored ? stored === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
				if (dark) document.documentElement.classList.add('dark');
			} catch {
				/* stockage indisponible : thème clair par défaut */
			}
		})();
	</script>
</svelte:head>

<div class="min-h-screen flex flex-col">
	{#if user}
		<header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
			<div class="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
				<a href="/" class="no-underline flex items-center">
					<img src="/logo.svg" alt="Rapports flash des élus" class="h-10 w-auto" />
				</a>
				<!-- Nav toujours visible : passe sur sa propre ligne en mobile -->
				<nav class="flex flex-wrap gap-x-4 gap-y-1 text-sm basis-full sm:basis-auto order-last sm:order-none">
					<a href="/" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white no-underline">Accueil</a>
					<a href="/rapport" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white no-underline">Mes rapports</a>
					<a href="/elus" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white no-underline">Élu·es</a>
					<a href="/projets" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white no-underline">Conseil informel</a>
					<a href="/admin" class="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white no-underline">Admin</a>
				</nav>
				<!-- Bureau (≥768px) : nom / thème / déconnexion toujours visibles -->
				<div class="ml-auto hidden md:flex items-center gap-3 text-sm">
					<ThemeToggle />
					<a href="/mon-compte" class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white no-underline">{user.full_name}</a>
					<form method="post" action="/deconnexion">
						<button
							type="submit"
							class="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent border-0 cursor-pointer p-0"
						>Déconnexion</button>
					</form>
				</div>
				<!-- Mobile / tablette : bouton menu (icône personne) -->
				<button
					type="button"
					class="ml-auto md:hidden p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 cursor-pointer"
					aria-label="Menu du compte"
					aria-expanded={mobileMenuOpen}
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="8" r="4" />
						<path d="M4 21v-1a7 7 0 0 1 14 0v1" />
					</svg>
				</button>
			</div>
			{#if mobileMenuOpen}
				<!-- Voile : fermer au clic extérieur -->
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<div class="fixed inset-0 z-10 bg-black/20" aria-hidden="true" onclick={() => (mobileMenuOpen = false)}></div>
				<!-- Popup du compte -->
				<div
					class="absolute right-4 top-full mt-1 z-20 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3"
				>
					<a href="/mon-compte" class="block font-medium text-slate-800 dark:text-slate-100 no-underline truncate"
						>{user.full_name}</a>
					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-500 dark:text-slate-400">Thème</span>
						<ThemeToggle />
					</div>
				<form method="post" action="/deconnexion" class="border-t border-slate-200 dark:border-slate-700 pt-3">
					<button
						type="submit"
						class="w-full rounded-lg bg-red-600 text-white text-sm font-medium px-3 py-2 hover:bg-red-700 cursor-pointer"
					>Déconnexion</button>
				</form>
			</div>
			{/if}
		</header>
	{:else}
		<!-- Pas de barre de navigation (non connecté) : bouton de thème flottant -->
		<div class="fixed top-4 right-4 z-10">
			<ThemeToggle />
		</div>
	{/if}
	<main class="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
		{@render children()}
	</main>
</div>
