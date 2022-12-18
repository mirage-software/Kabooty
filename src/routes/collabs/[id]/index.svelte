<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { t } from 'svelte-intl-precompile';

	import { onMount } from 'svelte';

	import { discord } from '../../../stores/discord';

	import axios from 'axios';
	import type { AnimeCharacter, Asset, Collab, CollabAsset, Pick, User } from '@prisma/client';
	import LoadingSpinner from '../../../components/generic/design/loading_spinner.svelte';
	import PageTitle from '../../../components/generic/design/page_title.svelte';
	import SolidButton from '../../../components/generic/design/solid_button.svelte';
	import PickComponent from '../../../components/collabs/pick.svelte';
	import InfiniteScroll from 'svelte-infinite-scroll';
	import InputText from '../../../components/generic/design/input_text.svelte';
	import Dropdown from '../../../components/collabs/register/extra/dropdown.svelte';
	import IconButton from '../../../components/collabs/icon_button.svelte';

	let pageIndex = 1;
	let data: (Pick & {
		user: User;
		character: AnimeCharacter;
		assets: (Asset & { collabAsset: CollabAsset })[];
	})[] = [];
	let newBatch: (Pick & {
		user: User;
		character: AnimeCharacter;
		assets: (Asset & { collabAsset: CollabAsset })[];
	})[] = [];

	let filtervalues: Array<string> = ['default', 'original', 'char', 'date', 'anime'];
	let fiterstrings: Array<string> = filtervalues.map((filter) => $t(`collabs.filter.${filter}`));

	let filter = 'default';
	let order = 'desc';
	let query = '';

	let loading = true;

	let cooldown: string | number | undefined;

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

	function setSearchTimer() {
		pageIndex = 1;
		data = [];
		newBatch = [];
		loading = true;
		if (cooldown) {
			clearTimeout(cooldown);
		}

		const timeOut = setTimeout(() => {
			getPicks();
			clearTimeout(cooldown);
		}, 1000);

		if (typeof timeOut === 'number' || typeof timeOut === 'string') {
			cooldown = timeOut;
		}
	}

	async function swapFilter() {
		if (order === 'desc') {
			order = 'asc';
		} else {
			order = 'desc';
		}
		await resetPicks();
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
					<div id="admin">
						<SolidButton
							click={() => goto('/collabs/' + collab?.id + '/manage')}
							color="green"
							string="collabs.update"
						/>
						<SolidButton
							click={() => goto('/api/collabs/' + collab?.id + '/export')}
							color="blue"
							string="collabs.export"
						/>
					</div>
				{/if}
			</div>
			<div id="filter">
				<InputText
					bind:value={query}
					onChanged={setSearchTimer}
					hint={$t('collabs.registration.character.search')}
				/>
				<div id="sort">
					<div id="dropdown">
						<Dropdown
							bind:value={filter}
							onChanged={resetPicks}
							data={filtervalues}
							strings={fiterstrings}
							placeholder={'Default'}
						/>
					</div>
					<IconButton icon="la la-angle-{order === 'desc' ? 'down' : 'up'}" click={swapFilter} />
				</div>
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

				#admin {
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					justify-items: center;
					align-items: stretch;
					align-self: stretch;
					align-content: stretch;

					gap: $margin-s;

					@media (min-width: 400px) {
						flex-direction: row;

						gap: $margin-xs;
						align-content: center;
					}
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

				align-items: stretch;

				#sort {
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					justify-items: center;
					align-items: stretch;
					align-self: stretch;
					align-content: stretch;

					gap: $margin-s;

					@media (min-width: 400px) {
						flex-direction: row;

						gap: $margin-xs;
						align-content: center;
					}
				}

				@media (min-width: $breakpoint-m) {
					flex-direction: row;
					justify-content: space-between;
				}
			}

			#picks {
				display: flex;
				flex-direction: row;

				align-self: stretch;

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
