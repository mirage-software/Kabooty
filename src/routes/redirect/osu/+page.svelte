<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';

	import { onMount } from 'svelte';
	import Error from '../../error.svelte';
	import Loading from '../../../components/generic/design/loading_spinner.svelte';
	import axios from 'axios';
	import { osu } from '../../../stores/osu';

	let error: string | undefined | null;

	onMount(async () => {
		try {
			const code = $page.url.searchParams.get('code');

			await axios.get('/api/osu/access', {
				headers: {
					Authorization: code ?? ''
				}
			});

			await osu.fetch();

			const redirect = localStorage.getItem('osu_page_redirect');

			if (redirect) {
				localStorage.removeItem('osu_page_redirect');
				goto(redirect);
			} else {
				goto('/profile');
			}
		} catch (_) {
			error = 'invalid_code';
		}
	});
</script>

{#if error}
	<Error type={'osu.' + error} />
{:else}
	<Loading />
{/if}
