<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';

	import { onMount } from 'svelte';
	import Error from '../error.svelte';

	let discordError: string | undefined | null;

	onMount(async () => {
		discordError = $page.url.searchParams.get('error');
	});

	// throw {
	// 	status: 400,
	// 	type: discordError
	// };
</script>

{#if discordError}
	<Error status={400} type={'discord.' + discordError} />
{/if}
