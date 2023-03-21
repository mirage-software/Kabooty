<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	import { discord } from '../../../stores/discord';

	import { onMount } from 'svelte';
	import Error from '../../error.svelte';
	import Loading from '../../components/loading_spinner.svelte';
	import axios from 'axios';
	import { osu } from '../../../stores/osu';
	import { base } from '$app/paths';

	let discordError: string | undefined | null;

	onMount(async () => {
		discordError = $page.url.searchParams.get('error');

		if (!discordError) {
			const code = $page.url.searchParams.get('code') ?? '';
			try {
				await axios.get('/api/auth/discord/access', {
					headers: {
						Authorization: code
					}
				});

				if (!$discord) {
					// Returns an encrypted session cookie to identify the user
					const user = await axios.get('/api/auth/discord/user');

					discord.update(user.data);
				}

				await osu.fetch();

				const redirect = localStorage.getItem('discord_page_redirect');

				if (redirect) {
					localStorage.removeItem('discord_page_redirect');
					goto(redirect);
				} else {
					goto(base + '/');
				}
			} catch (_) {
				discordError = 'invalid_code';
			}
		}
	});
</script>

{#if discordError}
	<Error type={'discord.' + discordError} />
{:else}
	<Loading />
{/if}
