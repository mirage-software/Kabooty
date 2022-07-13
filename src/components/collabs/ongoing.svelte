<script lang="ts">
	import Card from '../generic/design/card.svelte';
	import { t } from 'svelte-intl-precompile';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import type { Collab } from '@prisma/client';
	import CollabCard from './collab.svelte';

	let collabs: Collab[] = [];

	onMount(async () => {
		collabs = (await axios.get('/api/collabs')).data;
	});
</script>

<h2>{$t('collabs.ongoing')}</h2>
<div id="ongoing">
	{#if collabs.length === 0}
		<div id="none">
			<Card>
				<div id="flex">
					<i class="las la-flushed" />
					<h2>{$t('collabs.no_ongoing')}</h2>
				</div>
			</Card>
		</div>
	{/if}
	{#each collabs as collab}
		<CollabCard {collab} />
	{/each}
</div>

<style lang="scss">
	h2 {
		margin: $margin-m;
		margin-top: $margin-s;
	}

	#ongoing {
		margin: $margin-m;
		margin-top: 0;
		margin-bottom: 0;

		width: 100%;
		max-width: calc(100% - $margin-m * 2);

		display: flex;
		gap: $margin-m;
		flex-wrap: wrap;

		justify-content: stretch;
		align-content: stretch;

		align-items: stretch;

		#none {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			width: 100%;

			#flex {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				gap: $margin-m;

				padding: $margin-m;

				i {
					font-size: 40pt;
					color: white;
				}

				h2 {
					margin: 0;
				}
			}
		}
	}
</style>
