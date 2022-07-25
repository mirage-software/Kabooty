<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { t } from 'svelte-intl-precompile';

	import { onMount } from 'svelte';

	import { discord } from '../../../stores/discord';

	import axios from 'axios';
	import type { AnimeCharacter, Collab, Pick, User } from '@prisma/client';
	import LoadingSpinner from '../../../components/generic/design/loading_spinner.svelte';
	import PageTitle from '../../../components/generic/design/page_title.svelte';
	import SolidButton from '../../../components/generic/design/solid_button.svelte';
	import PickComponent from '../../../components/collabs/pick.svelte';
	import InfiniteScroll from 'svelte-infinite-scroll';
	import InputText from '../../../components/generic/design/input_text.svelte';
	import Dropdown from '../../../components/collabs/register/extra/dropdown.svelte';
	import IconButton from '../../../components/collabs/icon_button.svelte';

	let pageIndex = 1;
	let data: (Pick & { User: User; character: AnimeCharacter })[] = [];
	let newBatch: (Pick & { User: User; character: AnimeCharacter })[] = [];

	let filtervalues: Array<string> = ['default', 'original', 'char', 'date', 'anime'];
	let fiterstrings: Array<string> = filtervalues.map((filter) => $t(`collabs.filter.${filter}`));

	let filter = 'default';
	let order = 'desc';
	let query = '';

	let loading = true;

	async function getPicks() {
		newBatch = (
			await axios.get(
				'/api/collabs/' +
					collab?.id +
					'/picks?page=' +
					pageIndex +
					'&query=' +
					query +
					'&sort=' +
					filter +
					'&order=' +
					order
			)
		).data;
		if (newBatch.length !== 25) {
			loading = false;
		}
	}

	async function swapFilter() {
		if (order === 'desc') {
			order = 'asc';
		} else {
			order = 'desc';
		}
		await filterPicks();
	}

	async function filterPicks() {
		data = [];
		newBatch = [];
		await getPicks();
	}

	async function clearFilter() {
		filter = 'default';
		order = 'desc';
		query = '';
		await filterPicks();
	}

	async function resetPicks() {
		pageIndex = 1;
		data = [];
		newBatch = [];
		loading = true;
		await getPicks();
	}

	let collab: Collab | null = null;

	onMount(async () => {
		const collabId = $page.params['id'];

		collab = (await axios.get('/api/collabs/' + collabId)).data;
		getPicks();
	});

	$: data = [...data, ...newBatch];
</script>

{#if collab && data}
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
			<div id="filter">
				<InputText
					maxWidth={'100%'}
					bind:value={query}
					title={'collabs.registration.character.search'}
					hint={'Yumiko'}
				/>
				<Dropdown
					bind:value={filter}
					data={filtervalues}
					strings={fiterstrings}
					title={'Sort'}
					placeholder={'Default'}
				/>
				{#if order === 'desc'}
					<IconButton icon="la la-angle-down" click={swapFilter} />
				{:else}
					<IconButton icon="la la-angle-up" click={swapFilter} />
				{/if}
				<SolidButton
					click={clearFilter}
					color="blue"
					string="collabs.registration.character.search_reset"
				/>
				<SolidButton
					click={filterPicks}
					color="green"
					string="collabs.registration.character.search"
				/>
			</div>
			<div id="picks">
				{#each data as pick}
					<PickComponent {pick} {collab} onChange={resetPicks} />
				{/each}

				<InfiniteScroll
					hasMore={loading}
					threshold={50}
					on:loadMore={() => {
						pageIndex++;
						getPicks();
					}}
					window={true}
				/>
			</div>
			{#if loading}
				<div id="spinner">
					<LoadingSpinner />
				</div>
			{/if}
		</div>
	</div>
{:else}
	<LoadingSpinner />
{/if}

<style lang="scss">
	#spinner {
		align-self: center;
	}

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

			#filter {
				display: flex;
				flex-direction: column;

				align-self: stretch;

				padding: $margin-m;
				padding-top: $margin-s;
				padding-bottom: 0;

				gap: $margin-s;

				align-items: left;

				@media (min-width: $breakpoint-m) {
					flex-direction: row;
				}
			}

			// Cant get it to fill screen when it breaks :madge:
			#dropdown {
				@media (max-width: $breakpoint-m) {
					max-width: 100%;
				}
			}

			#picks {
				display: flex;
				flex-direction: row;

				flex-wrap: wrap;

				padding: $margin-m;
				padding-top: $margin-m;
				padding-bottom: 0;

				gap: $margin-s;

				align-items: stretch;
				justify-content: stretch;
			}
		}
	}
</style>
