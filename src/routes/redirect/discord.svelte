<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	import { discord } from '../../stores/discord';

	import { onMount } from 'svelte';
	import Error from '../error.svelte';
	import Loading from '../../components/generic/design/loading_spinner.svelte';
	import axios from 'axios';

	let discordError: string | undefined | null;

	onMount(async () => {
		discordError = $page.url.searchParams.get('error');

		if (!discordError) {
			const code = $page.url.searchParams.get('code') ?? '';
			try {
				await axios.get('/api/discord/access', {
					headers: {
						Authorization: code
					}
				});

				goto(localStorage.getItem('discord_page_redirect') ?? '/profile');
			} catch (_) {
				discordError = 'invalid_code';
			}
		}
	});
</script>

{#if discordError}
	<Error status={400} type={'discord.' + discordError} />
{:else}
	<Loading />
{/if}
