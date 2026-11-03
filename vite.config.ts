/// <reference types="@sveltejs/kit/vite" />
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			paths: {
				// adapter-node (v6) ne lit plus ORIGIN à l'exécution : l'origine
				// "self" est figée au build via paths.origin, sinon elle est
				// dérivée des en-têtes de la requête (protocole par défaut: https),
				// ce qui casse le CSRF check en http:// ou derrière un proxy.
				// ex: ORIGIN=http://192.168.122.1:3047 npm run build
				origin: process.env.ORIGIN
			},
			csrf: {
				// SvelteKit 3 a retiré `checkOrigin` au profit de `trustedOrigins` :
				// un POST n'est accepté que si l'en-tête Origin correspond au site
				// (dérivé de request.url) ou figure ici. Derrière le reverse proxy
				// du VPS, l'origin public (https://…) ne correspond pas à l'URL
				// interne vue par adapter-node : indiquer l'origine publique à la
				// build, ex : TRUSTED_ORIGINS=https://rapports.exemple.fr npm run build
				trustedOrigins: (process.env.TRUSTED_ORIGINS ?? '').split(',').filter(Boolean)
			},
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		}),
		tailwindcss()
	]
});
