<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { onMount } from 'svelte';

	import { discord } from '../../../stores/discord';

	import axios from 'axios';
	import type { Collab, Pick, User } from '@prisma/client';
	import LoadingSpinner from '../../../components/generic/design/loading_spinner.svelte';
	import PageTitle from '../../../components/generic/design/page_title.svelte';
	import SolidButton from '../../../components/generic/design/solid_button.svelte';
	import PickComponent from '../../../components/collabs/pick.svelte';
	import ImageContainer from '../../../components/generic/design/image_container.svelte';

	let picks: (Pick & { User: User })[] | null = null;
	let collab: Collab | null = null;

	onMount(async () => {
		const collabId = $page.params['id'];

		collab = (await axios.get('/api/collabs/' + collabId)).data;
		picks = (await axios.get('/api/collabs/' + collabId + '/picks')).data;
	});
</script>

{#if collab && picks}
	<div id="column">
		<div id="content">
			<div id="title">
				<PageTitle value={collab.title} />
				{#if $discord?.admin}
					<SolidButton
						click={() => goto('/collabs/' + collab?.id + '/manage')}
						color="green"
						string="collabs.update"
					/>
				{/if}
			</div>
			<div id="picks">
				{#each picks as pick}
					<PickComponent {pick} {collab} />
				{/each}
			</div>
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

			padding-bottom: $margin-m;

			#title {
				display: flex;
				flex-direction: column;

				align-self: stretch;

				justify-content: space-between;

				padding: $margin-m;
				padding-top: $margin-l;
				padding-bottom: 0;

				gap: $margin-s;

				align-items: start;

				@media (min-width: 400px) {
					flex-direction: row;
				}
			}

			#picks {
				display: flex;
				flex-direction: row;

				flex-wrap: wrap;

				padding: $margin-m;
				padding-top: $margin-l;
				padding-bottom: 0;

				gap: $margin-s;

				align-items: stretch;
				justify-content: stretch;
			}
		}
	}
</style>
