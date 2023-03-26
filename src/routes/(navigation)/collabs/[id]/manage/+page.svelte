<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { onDestroy, onMount } from 'svelte';

	import { discord } from '../../../../../stores/discord';

	import axios from 'axios';
	import Manage from '../../components/manage.svelte';
	import type { Unsubscriber } from 'svelte/store';
	import type { Collab, CollabAsset } from '@prisma/client';
	import LoadingSpinner from '../../../../components/loading_spinner.svelte';

	let subscription: Unsubscriber | null = null;

	let collab: (Collab & { collabAssets: CollabAsset[] }) | null = null;

	onMount(async () => {
		const result = await axios.get('/api/auth/discord/authenticated');

		if (!result.data.authenticated) {
			goto('/');
			return;
		}

		subscription = discord.subscribe((user) => {
			if (user && !user.admin) {
				goto('/');
			}
		});

		const collabId = $page.params['id'];

		collab = (await axios.get('/api/collabs/' + collabId)).data;
	});

	onDestroy(() => {
		if (subscription) {
			subscription();
		}
	});
</script>

{#if $discord && collab}
	<div id="column">
		<div id="content">
			<Manage {collab} />
		</div>
	</div>
{:else}
	<LoadingSpinner />
{/if}

<style lang="scss">
	#column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;

		#content {
			width: 100%;
			max-width: $max-width + $margin-s * 2;

			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;
		}
	}
</style>
