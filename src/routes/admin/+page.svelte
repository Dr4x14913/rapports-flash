<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import { currentMonth } from '#lib/months';

	let { data }: { data: PageData } = $props();

	let search = $state('');
	let editingId = $state<number | null>(null);
	const visibleMembers = $derived.by(() => {
		const query = search.trim().toLowerCase();
		if (!query) return data.members;
		return data.members.filter(
			(member) =>
				member.full_name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query)
		);
	});

	function confirmDeletion(memberName: string): boolean {
		return confirm(`Supprimer le compte de ${memberName} ? Ses rapports resteront conservés.`);
	}
</script>

{#if !data.passwordSet}
	<!-- Premier accès : définition du mot de passe d’administration -->
	<div class="mx-auto max-w-md w-full">
		<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
			<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Mot de passe d’administration</h1>
			<p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
				Aucun mot de passe n’est encore défini. Choisissez un mot de passe (8 caractères minimum) :
				c’est lui qui donnera accès à cette page d’administration.
			</p>
			{#if page.form?.error}
				<div class="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 mb-4">
					{page.form.error}
				</div>
			{/if}
			<form method="post" action="?/setup" class="space-y-3">
				<div>
					<label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Mot de passe</label>
					<input
						id="password"
						name="password"
						type="password"
						minlength="8"
						autocomplete="new-password"
						required
						class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
					/>
				</div>
				<div>
					<label for="confirm" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Confirmation</label>
					<input
						id="confirm"
						name="confirm"
						type="password"
						minlength="8"
						autocomplete="new-password"
						required
						class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
					/>
				</div>
				<button
					type="submit"
					class="w-full rounded-lg bg-brand-700 text-white font-medium px-4 py-2 hover:bg-brand-800 cursor-pointer"
				>
					Définir le mot de passe
				</button>
			</form>
		</section>
	</div>
{:else if !data.admin}
	<!-- Mot de passe défini : connexion admin -->
	<div class="mx-auto max-w-md w-full">
		<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
			<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Administration</h1>
			<p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Cette page est protégée par mot de passe.</p>
			{#if page.form?.error}
				<div class="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3 mb-4">
					{page.form.error}
				</div>
			{/if}
			<form method="post" action="?/login" class="space-y-3">
				<div>
					<label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Mot de passe</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
					/>
				</div>
				<button
					type="submit"
					class="w-full rounded-lg bg-brand-700 text-white font-medium px-4 py-2 hover:bg-brand-800 cursor-pointer"
				>
					Se connecter
				</button>
			</form>
		</section>
	</div>
{:else}
	<!-- Panneau d’administration (session admin valide) -->
	<div class="space-y-8">
		<div class="flex flex-wrap items-start justify-between gap-3">
			<div>
				<h1 class="text-xl font-semibold text-slate-800 dark:text-slate-100">Administration</h1>
				<p class="text-sm text-slate-500 dark:text-slate-400">Gestion des comptes et export des données.</p>
			</div>
			<form method="post" action="?/logout">
				<button
					type="submit"
					class="text-sm text-slate-600 dark:text-slate-300 bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 cursor-pointer"
				>
					Déconnexion admin
				</button>
			</form>
		</div>

		{#if page.form?.flash}
			<div class="rounded-lg bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-200 text-sm px-4 py-3">
				{page.form.flash}
			</div>
		{/if}
		{#if page.form?.error}
			<div class="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm px-4 py-3">
				{page.form.error}
			</div>
		{/if}

		<!-- Création d'un compte -->
		<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
			<h2 class="font-semibold text-slate-800 dark:text-slate-100 mb-1">Créer un compte d’élu(e)</h2>
			<p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
				Le lien de bienvenue et le mot de passe initial sont à transmettre par e-mail manuellement.
			</p>
			<form method="post" action="?/create" class="grid gap-3 sm:grid-cols-3 items-end">
				<div>
					<label for="full_name" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Nom complet</label>
					<input
						id="full_name"
						name="full_name"
						value={page.form?.values?.full_name ?? ''}
						required
						class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
					/>
				</div>
				<div>
					<label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">E-mail</label>
					<input
						id="email"
						name="email"
						type="email"
						value={page.form?.values?.email ?? ''}
						required
						class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
					/>
				</div>
				<div>
					<label
						for="password"
						class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
						>Mot de passe initial</label>
					<input
						id="password"
						name="password"
						type="password"
						minlength="8"
						required
						class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
					/>
				</div>
				<div class="sm:col-span-3">
					<button
						type="submit"
						class="rounded-lg bg-brand-700 text-white font-medium px-4 py-2 hover:bg-brand-800 cursor-pointer"
					>
						Créer le compte
					</button>
				</div>
			</form>
		</section>

		<!-- Liste des comptes -->
		<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
			<div class="flex flex-wrap items-center justify-between gap-3 mb-3">
				<div>
					<h2 class="font-semibold text-slate-800 dark:text-slate-100">Comptes</h2>
					<p class="text-sm text-slate-500 dark:text-slate-400">Comptes des élu(e)s : activation, modification et suppression.</p>
				</div>
				<div class="relative">
					<label for="search-members" class="sr-only">Rechercher un compte</label>
					<input
						id="search-members"
						type="search"
						placeholder="Rechercher (nom, e-mail)…"
						bind:value={search}
						class="w-64 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
					/>
				</div>
			</div>
			<div class="rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
				{#if visibleMembers.length === 0}
					<p class="px-4 py-6 text-sm text-slate-500 dark:text-slate-400 text-center">
						Aucun compte ne correspond à « {search} ».
					</p>
				{:else}
				{#each visibleMembers as member (member.id)}
					<div class="px-4 py-3 space-y-2">
						<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
							<span class="font-medium text-slate-800 dark:text-slate-100">{member.full_name}</span>
							<span class="text-sm text-slate-500 dark:text-slate-400">{member.email}</span>
							{#if member.is_active === 0}
								<span class="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full px-2 py-0.5"
									>désactivé</span
								>
							{/if}
							<div class="ml-auto flex flex-wrap items-center gap-2">
								<form method="post" action="?/toggle-active" class="inline">
									<input type="hidden" name="member_id" value={member.id} />
									{#if member.is_active === 1}
										<input type="hidden" name="action" value="deactivate" />
										<button
											type="submit"
											class="text-sm text-red-700 dark:text-red-300 bg-transparent border border-red-200 dark:border-red-800 rounded-lg px-3 py-1 hover:bg-red-50 dark:hover:bg-red-900 dark:bg-red-950/50 cursor-pointer"
										>
											Désactiver
										</button>
									{:else}
										<input type="hidden" name="action" value="activate" />
										<button
											type="submit"
											class="text-sm text-red-700 dark:text-red-300 bg-transparent border border-red-200 dark:border-red-800 rounded-lg px-3 py-1 hover:bg-red-50 dark:hover:bg-red-900 dark:bg-red-950/50 cursor-pointer"
										>
											Réactiver
										</button>
									{/if}
								</form>
								<button
									type="button"
									onclick={() => (editingId = editingId === member.id ? null : member.id)}
									class="text-sm text-slate-700 dark:text-slate-200 bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
								>
									Modifier
								</button>
								{#if member.is_active === 0}
									<form
										method="post"
										action="?/delete"
										onsubmit={(event) => !confirmDeletion(member.full_name) && event.preventDefault()}
									>
										<input type="hidden" name="member_id" value={member.id} />
										<button
											type="submit"
											class="text-sm text-red-700 dark:text-red-300 bg-transparent border border-red-200 dark:border-red-800 rounded-lg px-3 py-1 hover:bg-red-50 dark:hover:bg-red-900 dark:bg-red-950/50 cursor-pointer"
										>
											Supprimer
										</button>
									</form>
								{/if}
							</div>
						</div>
						<form method="post" action="?/reset-password" class="flex flex-wrap items-center gap-2">
							<input type="hidden" name="member_id" value={member.id} />
							<label for="reset-{member.id}" class="text-sm text-slate-500 dark:text-slate-400"
								>Nouveau mot de passe :</label>
							<input
								id="reset-{member.id}"
								name="new_password"
								type="password"
								minlength="8"
								autocomplete="new-password"
								placeholder="8 caractères min."
								class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-brand-500"
							/>
							<button
								type="submit"
								class="text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
							>
								Réinitialiser
							</button>
						</form>
						{#if editingId === member.id}
							<form
								method="post"
								action="?/update"
								class="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto] items-end"
							>
								<input type="hidden" name="member_id" value={member.id} />
								<div>
									<label for="name-{member.id}" class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1"
										>Nom complet</label>
									<input
										id="name-{member.id}"
										name="full_name"
										value={member.full_name}
										required
										class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
									/>
								</div>
								<div>
									<label for="mail-{member.id}" class="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">E-mail</label>
									<input
										id="mail-{member.id}"
										name="email"
										type="email"
										value={member.email}
										required
										class="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
									/>
								</div>
								<button
									type="submit"
									class="text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
								>
									Enregistrer
								</button>
							</form>
						{/if}
						</div>
				{/each}
				{/if}
				</div>
			</section>

		<!-- Logo du site -->
		<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
			<h2 class="font-semibold text-slate-800 dark:text-slate-100 mb-1">Logo du site</h2>
			<p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
				Image affichée dans l’en-tête, à côté du nom « Rapports flash des élus ». Formats acceptés : PNG,
				JPEG, WebP ou SVG, 500 Ko maximum — une image carrée sur fond transparent est idéale. La couleur
				dominante du logo sert de couleur principale à l’interface ; un logo monochrome conserve le thème
				par défaut.
			</p>
			<div class="flex flex-wrap items-center gap-4">
				<img
					src={data.logo ?? '/logo.svg'}
					alt="Aperçu du logo actuel"
					class="h-14 w-14 object-contain rounded-lg border border-slate-200 dark:border-slate-700"
				/>
				<form method="post" action="?/upload-logo" enctype="multipart/form-data" class="flex flex-wrap items-center gap-2">
					<input
						id="logo"
						name="logo"
						type="file"
						accept="image/png,image/jpeg,image/webp,image/svg+xml"
						required
						class="text-sm text-slate-600 dark:text-slate-300 cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-brand-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-800 file:cursor-pointer"
					/>
					<button
						type="submit"
						class="rounded-lg bg-brand-700 text-white font-medium px-4 py-2 hover:bg-brand-800 cursor-pointer"
					>
						Enregistrer le logo
					</button>
				</form>
				{#if data.logo}
					<form
						method="post"
						action="?/remove-logo"
						onsubmit={(event) => !confirm('Revenir au logo par défaut ?') && event.preventDefault()}
					>
						<button
							type="submit"
							class="text-sm text-slate-700 dark:text-slate-200 bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
						>
							Revenir au logo par défaut
						</button>
					</form>
				{/if}
			</div>
		</section>

		<!-- Nombre de mois affichés sur la page d'accueil -->
		<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
			<h2 class="font-semibold text-slate-800 dark:text-slate-100 mb-1">Mois affichés sur la page d’accueil</h2>
			<p class="text-sm text-slate-500 dark:text-slate-400 mb-3">
				La page d’accueil liste une plage de mois autour du mois en cours : combien de mois passés et combien de
				mois à venir afficher.
			</p>
			<form method="post" action="?/set-months" class="flex flex-wrap items-end gap-4">
				<div class="flex items-end gap-3 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
					<div>
						<label for="months_count" class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Mois passés (1-24)</label>
						<input
							id="months_count"
							name="months_count"
							type="number"
							min="1"
							max="24"
							required
							value={page.form?.values?.months_count ?? page.data.visibleMonths}
							class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 w-20 focus:outline-none focus:ring-2 focus:ring-brand-500"
						/>
					</div>
					<span class="pb-2 text-slate-300 dark:text-slate-600">+</span>
					<div>
						<label for="future_months_count" class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Mois futurs (0-12)</label>
						<input
							id="future_months_count"
							name="future_months_count"
							type="number"
							min="0"
							max="12"
							required
							value={page.form?.values?.future_months_count ?? page.data.futureMonths}
							class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 w-20 focus:outline-none focus:ring-2 focus:ring-brand-500"
						/>
					</div>
				</div>
				<button
					type="submit"
					class="rounded-lg bg-brand-700 text-white font-medium px-4 py-2 hover:bg-brand-800 cursor-pointer"
				>
					Enregistrer
				</button>
			</form>
		</section>

		<!-- Export -->
		<section class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
			<h2 class="font-semibold text-slate-800 dark:text-slate-100 mb-1">Export CSV</h2>
			<p class="text-sm text-slate-500 dark:text-slate-400 mb-3">
				Cols : élu ; mois ; actions menées ; actions prévues ; coopérations ; projets.
			</p>
			<div class="flex flex-wrap gap-2">
				<a
					href="/admin/export.csv"
					class="rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 no-underline hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
				>
					Tous les rapports
				</a>
				<a
					href="/admin/export.csv?mois={currentMonth()}"
					class="rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium px-4 py-2 no-underline hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800"
				>
					Mois courant
				</a>
			</div>
		</section>
	</div>
{/if}
