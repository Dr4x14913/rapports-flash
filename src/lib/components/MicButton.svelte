<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	interface Props {
		onResult: (text: string) => void;
		label?: string;
	}

	let { onResult, label = 'Dictée vocale' }: Props = $props();

	let supported = $state(false);
	let listening = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let recognition: any = null;

	onMount(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
		if (!SpeechRecognition) {
			supported = false;
			return;
		}
		supported = true;
		recognition = new SpeechRecognition();
		recognition.lang = 'fr-FR';
		recognition.continuous = true;
		recognition.interimResults = false;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		recognition.onresult = (event: any) => {
			let text = '';
			for (let index = event.resultIndex; index < event.results.length; index++) {
				const result = event.results[index];
				if (result.isFinal) text += result[0].transcript;
			}
			if (text.trim()) onResult(text.trim());
		};
		recognition.onend = () => {
			listening = false;
		};
		recognition.onerror = () => {
			listening = false;
		};
	});

	onDestroy(() => {
		if (recognition) recognition.abort();
	});

	function toggle(): void {
		if (!recognition) return;
		if (listening) {
			recognition.stop();
			listening = false;
		} else {
			recognition.start();
			listening = true;
		}
	}
</script>

{#if supported}
	<button
		type="button"
		onclick={toggle}
		aria-pressed={listening}
		title={label}
		aria-label={label}
		class={`inline-flex items-center justify-center rounded-full w-8 h-8 shrink-0 text-white cursor-pointer transition-colors ${
			listening ? 'bg-red-600 animate-pulse' : 'bg-red-500 hover:bg-red-600'
		}`}
	>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
			<path
				d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"
			/>
		</svg>
	</button>
{/if}
