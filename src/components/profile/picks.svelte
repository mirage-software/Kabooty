<script lang="ts">
	import Card from '../generic/design/card.svelte';
	import { t } from 'svelte-intl-precompile';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import type { Collab, Pick, User } from '@prisma/client';
	import PickCard from '../collabs/pick.svelte';

	let picks: (Pick & { User: User | null; collab: Collab })[] = [];

	onMount(async () => {
		getPicks();
	});

	async function getPicks() {
		picks = (await axios.get('/api/picks')).data;
	}

	function getTypedPick(pick: Pick & { User: User | null; collab: Collab }): Pick & { User: User } {
		return {
			...pick,
			User: pick.User!
		};
	}
</script>

<h2>{$t('account.picks.title')}</h2>
<div id="picks">
	{#if picks.length === 0}
		<div id="none">
			<Card>
				<div id="flex">
					<i class="las la-flushed" />
					<h2>{$t('account.picks.none')}</h2>
				</div>
			</Card>
		</div>
	{/if}
	{#each picks as pick}
		<PickCard
			pick={getTypedPick(pick)}
			collab={pick['collab']}
			profile={true}
			onChange={getPicks}
		/>
	{/each}
</div>

<style lang="scss">
	h2 {
		margin: $margin-m;
		margin-top: $margin-l;
	}

	#picks {
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
