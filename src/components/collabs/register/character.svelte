<script lang="ts">
	import { t } from 'svelte-intl-precompile';
	import SolidButton from '../../generic/design/solid_button.svelte';
	import Card from '../../generic/design/card.svelte';
	import type { AnimeCharacter, Collab, Pick } from '@prisma/client';
	import axios from 'axios';
	import InputText from '../../generic/design/input_text.svelte';
	import Character from './character/character.svelte';
	import { selected } from './character/selected_store';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Paginator from '../../../components/generic/design/paginator.svelte';

	export let collab: Collab;

	export let submit: (
		data: AnimeCharacter | null | undefined,
		name: string | null | undefined
	) => Promise<void>;

	let results: (AnimeCharacter & { Pick: Pick[] })[] | null = null;

	let newPage: number | null = null;

	let query = '';
	let customName = '';

	let total = 0;
	let page = 1;

	onMount(async () => {
		try {
			await axios.get('/api/collabs/' + collab.id + '/open');
		} catch (_) {
			goto('/collabs/' + collab.id + '/error?error=errors.collab_closed');
		}
	});

	async function searchCharacters() {
		if (query.length < 2 || !collab?.id) {
			results = null;
			return;
		}

		if (newPage) {
			page = newPage;
			newPage = null;
		}

		const response = await axios.get(
			`/api/collabs/${collab.id}/characters?search=${query}&page=${page}`
		);

		total = response.data.count;
		results = response.data.characters;
	}

	let cooldown: string | number | undefined;

	function setSearchTimer() {
		if (cooldown) {
			clearTimeout(cooldown);
		}

		const timeOut = setTimeout(() => {
			searchCharacters();
			clearTimeout(cooldown);
		}, 1000);

		if (typeof timeOut === 'number' || typeof timeOut === 'string') {
			cooldown = timeOut;
		}
	}
</script>

<h3>{$t('collabs.registration.character.pick')}</h3>
<div id="character">
	<Card>
		<div id="content">
			<div id="title">
				<h4>{$t('collabs.registration.character.search_title')}</h4>
				<h5>{$t('collabs.registration.character.search_subtitle')}</h5>
			</div>
			<InputText
				bind:value={query}
				title={'collabs.registration.character.search'}
				hint={'Yumiko'}
				onChanged={setSearchTimer}
			/>
			{#if results}
				<Paginator
					pageCount={Math.ceil(total / 50)}
					updatePage={(_) => {
						page = _;
						searchCharacters();
					}}
				/>
				<div id="results">
					{#each results as result}
						<Character
							character={result}
							onClick={(_) => {
								selected.update({
									id: _.id,
									name: _.name,
									anime_name: _.anime_name
								});
							}}
						/>
					{/each}
					<Character
						character={{
							name: $t('collabs.registration.character.custom'),
							anime_name: $t('collabs.registration.character.original'),
							id: -1,
							Pick: []
						}}
						onClick={(_) => {
							selected.update({
								id: _.id,
								name: query,
								anime_name: 'Custom'
							});
						}}
					/>
				</div>
			{/if}
			{#if $selected && $selected.id === -1}
				<InputText
					bind:value={customName}
					title={'collabs.registration.character.name'}
					hint={'Yumiko'}
				/>
			{/if}
			{#if $selected && ($selected.id !== -1 || ($selected.id === -1 && customName.length > 2))}
				<SolidButton
					click={async () => submit($selected, customName)}
					color="green"
					string="collabs.registration.submit"
				/>
			{/if}
		</div>
	</Card>
</div>

<style lang="scss">
	h3 {
		margin: $margin-m;
		margin-top: $margin-s;
	}

	h4 {
		margin: 0;
	}

	h5 {
		margin: 0;
		font-weight: 400;
		font-style: italic;
	}

	#character {
		margin: $margin-m;
		margin-top: 0;
		margin-bottom: $margin-m;

		width: 100%;
		max-width: calc(100% - $margin-m * 2);

		#content {
			padding: $margin-m;

			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: $margin-m;

			#title {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}

			#results {
				display: flex;

				flex-direction: row;
				flex-wrap: wrap;
				gap: calc($margin-s);
				width: 100%;
			}
		}
	}
</style>
