<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';

	import { onMount } from 'svelte';
	import Error from '../error.svelte';
	import Loading from '../../components/generic/design/loading_spinner.svelte';
	import axios from 'axios';

	let error: string | undefined | null;

	onMount(async () => {
        const jwtoken = $page.url.searchParams.get('state');
		if (jwtoken) {
			const code = $page.url.searchParams.get('code');
			if(code) {
				try {
					await axios.get('/api/osu/access', {
						headers: {
							Authorization: code+"|"+jwtoken
						}
					});

					goto('/profile');
				} catch (_) {
					error = 'invalid_code';
				}
			} else {
				error = 'invalid_code';
			}
			
		} else {
            error = "no_state";
        }
	});
</script>

{#if error}
	<Error status={400} type={'osu.' + error} />
{:else}
	<Loading />
{/if}
