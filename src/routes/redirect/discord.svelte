<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	import { discord } from '../../stores/discord';

	import { onMount } from 'svelte';
	import Error from '../error.svelte';

	let discordError: string | undefined | null;

	onMount(async () => {
		discordError = $page.url.searchParams.get('error');

		if (!discordError) {
			discord.update($page.url.searchParams.get('code') ?? '');
		}
	});
</script>

{#if discordError}
	<Error status={400} type={'discord.' + discordError} />
{/if}
