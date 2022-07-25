<script lang="ts">
	import { goto } from '$app/navigation';

	import { onDestroy, onMount } from 'svelte';

	import { discord } from '../../stores/discord';

	import axios from 'axios';
	import Manage from '../../components/collabs/manage.svelte';
	import type { Unsubscriber } from 'svelte/store';

	let subscription: Unsubscriber | null = null;

	onMount(async () => {
		const result = await axios.get('/api/discord/authenticated');

		if (!result.data.authenticated) {
			goto('/');
			return;
		}

		subscription = discord.subscribe((user) => {
			if (user && !user.admin) {
				goto('/');
			}
		});
	});

	onDestroy(() => {
		if (subscription) {
			subscription();
		}
	});
</script>

{#if $discord}
	<div id="column">
		<div id="content">
			<Manage />
		</div>
	</div>
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
