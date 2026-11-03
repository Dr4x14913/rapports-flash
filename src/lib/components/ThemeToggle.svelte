<script lang="ts">
	let dark = $state(false);

	$effect(() => {
		// Synchronise l'icône avec la classe .dark posée par le script d'anti-flash.
		dark = document.documentElement.classList.contains('dark');
	});

	function toggle() {
		const next = !dark;
		document.documentElement.classList.toggle('dark', next);
		localStorage.setItem('theme', next ? 'dark' : 'light');
		dark = next;
	}
</script>

<button
	type="button"
	onclick={toggle}
	class="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
	aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
	title={dark ? 'Mode clair' : 'Mode sombre'}
>
	{#if dark}
		<!-- Soleil -->
		<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
			stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
		</svg>
	{:else}
		<!-- Lune -->
		<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
			stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	{/if}
</button>
