<script lang="ts">
	import { goto } from '$app/navigation';

	import { discord } from '../../../stores/discord';

	import SolidButton from '../../../components/generic/design/solid_button.svelte';
	import PageTitle from '../../../components/generic/design/page_title.svelte';
	import { t } from 'svelte-intl-precompile';
	import type {
		Collab,
		CollabAsset,
		CollabEarlyAccess,
		Guild,
		GuildRole,
		UserGuildRole
	} from '@prisma/client';
	import type { PageData } from './$types';
	import CollabCard from './components/collab.svelte';
	import LoadingSpinner from '../../components/loading_spinner.svelte';
	import Bricks from '../../components/bricks.svelte';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type Masonry from 'masonry-layout';
	import InfiniteScroll from 'svelte-infinite-scroll';
	import { clientHeight } from '../../components/footer';
	import CreateCollab from './components/create_collab.svelte';
	import Dropdown from './components/register/extra/dropdown.svelte';
	import Filtering from '../../components/filtering.svelte';

	type CollabsPageData = (Collab & {
		guild:
			| (Guild & {
					userRoles: UserGuildRole[];
			  })
			| null;
		collabAssets: CollabAsset[];
		earlyAccessRoles: (CollabEarlyAccess & {
			guildRole: GuildRole;
		})[];
		_count: {
			participants: number;
		};
	})[];

	let pageIndex = 2;
	export let data: PageData;

	const sortstrings: Array<string> = data.sorts.map((_sort) => $t(`collabs.sorts.${_sort}`));

	let sort = 'default';
	let order = 'asc';
	let status: string | undefined = undefined;
	let query = '';

	let loading = data.collabs.length === 50;

	async function getCollabs() {
		const newData: CollabsPageData = await (
			await fetch(
				'/api/collabs?page=' +
					pageIndex +
					'&query=' +
					query +
					'&sort=' +
					sort +
					'&order=' +
					order +
					'&status=' +
					status
			)
		).json();
		if (newData.length !== 50) {
			loading = false;
		}

		_append(newData);
	}

	async function swapFilter() {
		if (order === 'desc') {
			order = 'asc';
		} else {
			order = 'desc';
		}
		await resetCollabs();
	}

	async function resetCollabs() {
		pageIndex = 1;
		_clear();
		loading = true;
		getCollabs();
	}

	let elements: Element[] = [];
	let createCollabElement: Element;

	function _append(collabs: CollabsPageData) {
		const newElements = collabs.map((collab) => {
			const element = document.createElement('div');
			element.id = 'masonry-grid-item';
			new CollabCard({
				target: element,
				props: {
					collab: collab
				}
			});

			return element;
		});

		if (elements.length === 0) {
			elements.push(createCollabElement);
			append([createCollabElement]);
		}

		elements.push(...newElements);
		append(newElements);
	}

	function _clear() {
		remove(elements);
		elements = [];
	}

	onMount(() => {
		if (browser) {
			createCollabElement = document.createElement('div');
			createCollabElement.id = 'masonry-grid-item';
			new CreateCollab({
				target: createCollabElement
			});

			_append(data.collabs);
		}
	});

	let remove: (elements: Element[]) => void;
	let append: (elements: Element[]) => void;

	const statusStrings = data.collabStatuses.map((status) => $t(`collabs.status.${status}`));
</script>

<div id="column">
	<div id="content">
		<div id="filtering">
			<Filtering
				sorts={data.sorts}
				{sortstrings}
				bind:sort
				bind:order
				bind:query
				on:search={resetCollabs}
				on:sort={resetCollabs}
				on:order={resetCollabs}
				on:filter={async (event) => {
					if (event.detail.type === 'status') {
						status = event.detail.value;
					}

					resetCollabs();
				}}
				filters={{
					status: {
						values: data.collabStatuses,
						strings: statusStrings,
						placeholder: $t(`collabs.filters.status`)
					}
				}}
			/>
		</div>
		<div id="title">
			<PageTitle string="collabs.title" />
		</div>
		<div id="collabs">
			<div id="masonry">
				<Bricks bind:append bind:remove />
			</div>
			{#if loading}
				<LoadingSpinner />
			{/if}
		</div>
		<InfiniteScroll
			hasMore={loading}
			threshold={($clientHeight ?? 0) + 400}
			on:loadMore={() => {
				pageIndex++;
				getCollabs();
			}}
			window={true}
		/>
	</div>
</div>

<style lang="scss">
	#filtering {
		margin-bottom: $margin-m;
	}

	#column {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;
		width: 100%;
		max-width: calc($max-width + $margin-xxl * 2);

		#content {
			padding: $margin-xxl;

			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: stretch;
			gap: $margin-s;

			#title {
				display: flex;
				flex-direction: column;

				justify-content: space-between;

				align-items: flex-start;

				@media (min-width: 400px) {
					flex-direction: row;
				}
			}

			#collabs {
				display: flex;
				flex-direction: column;
				gap: $margin-xxl;
			}
		}
	}
</style>
