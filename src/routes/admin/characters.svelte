<script lang="ts">
	import { goto } from '$app/navigation';

	import { t } from 'svelte-intl-precompile';

	import { discord } from '../../stores/discord';

	import SolidButton from '../../components/generic/design/solid_button.svelte';
	import PageTitle from '../../components/generic/design/page_title.svelte';
	import type { AnimeCharacter, Pick } from '@prisma/client';
	import axios from 'axios';
	import InputText from '../../components/generic/design/input_text.svelte';
	import AdminCharacter from '../../components/admin/characters/admin_character.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';
	import Paginator from '../../components/generic/design/paginator.svelte';
	import Dropdown from '../../components/collabs/register/extra/dropdown.svelte';
	import IconButton from '../../components/collabs/icon_button.svelte';

	let subscription: Unsubscriber | null = null;
	let initialized = false;

	let newName = '';
	let newAnime = '';
	let json = '';

	let filtervalues: Array<string> = ['default', 'char', 'anime'];
	let fiterstrings: Array<string> = filtervalues.map((filter) => $t(`collabs.filter.${filter}`));

	let characters: (AnimeCharacter & {
		Pick: Pick[];
	})[];
	let page = 1;
	let newPage: number | null = null;
	let query: string | undefined;
	let filter = 'default';
	let order = 'asc';
	let total = 0;
	let authorised: Boolean = false

	async function getCharacters() {
		const URIQuery = encodeURIComponent(query || '');

		if (newPage) {
			page = newPage;
			newPage = null;
		}

		const response = await axios.get(
			query
				? `/api/characters?search=${URIQuery}&sort=${filter}&order=${order}&page=${page}`
				: `/api/characters?page=${page}&sort=${filter}&order=${order}`
		);

		characters = response.data.characters;
		total = response.data.count;
	}

	async function swapFilter() {
		if (order === 'desc') {
			order = 'asc';
		} else {
			order = 'desc';
		}
		await getCharacters();
	}

	onMount(async () => {
		const result = await axios.get('/api/discord/authenticated');

		if (!result.data.authenticated) {
			goto('/');
			return;
		}

		subscription = discord.subscribe((user) => {
			if (user && !user.admin) {
				goto('/');
			} else {
				if (!initialized) {
					initialized = true;
					getCharacters();
				}
			}
			if (user?.admin == true){
				authorised = true;
			}
		});
	});

	onDestroy(() => {
		if (subscription) {
			subscription();
		}
	});

	let cooldown: string | number | undefined;

	function setSearchTimer() {
		newPage = 1;
		if (cooldown) {
			clearTimeout(cooldown);
		}

		const timeOut = setTimeout(() => {
			getCharacters();
			clearTimeout(cooldown);
		}, 1000);

		if (typeof timeOut === 'number' || typeof timeOut === 'string') {
			cooldown = timeOut;
		}
	}

	function isJSONValid(json: string) {
		try {
			const result = JSON.parse(json);

			if (!Array.isArray(result)) {
				return false;
			}

			for (let i = 0; i < result.length; i++) {
				const element = result[i];

				if (!element.name || !element.anime_name) {
					return false;
				}
			}

			return true;
		} catch (e) {
			return false;
		}
	}
</script>

<div id="column">
	<div id="content">
		<div id="title">
			<PageTitle string="admin.buttons.characters.title" />
		</div>
		{#if !authorised }
		<h2 class="s-O1LqmXjLTMeC">You are not Authorised</h2>
		{/if}
		{#if authorised }
			<div id="overview">
				<h3>{$t('admin.characters.manage')}</h3>
				<div id="characters">
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
									onChanged={getCharacters}
									data={filtervalues}
									strings={fiterstrings}
									placeholder={'Default'}
								/>
							</div>
							<IconButton icon="la la-angle-{order === 'desc' ? 'up' : 'down'}" click={swapFilter} />
						</div>
					</div>
					{#if characters}
						<Paginator
							pageCount={Math.ceil(total / 50)}
							updatePage={(_) => {
								page = _;
								getCharacters();
							}}
						/>
						<div id="results">
							{#each characters as result}
								<AdminCharacter character={result} onDelete={getCharacters} />
							{/each}
						</div>
					{/if}
				</div>
			</div>
			<div id="add">
				<h3>{$t('admin.characters.add_single')}</h3>
				<div id="single">
					<div id="input">
						<InputText
							bind:value={newName}
							title={'collabs.registration.character.name'}
							hint={'Ozen'}
						/>
						<InputText
							bind:value={newAnime}
							title={'admin.characters.source'}
							hint={'Stay! Stay! DPRK!'}
						/>
					</div>
					<SolidButton
						click={async () => {
							await axios.post('/api/characters', [
								{
									name: newName,
									anime: newAnime
								}
							]);

							newName = '';
							newAnime = '';
						}}
						color="green"
						string="admin.characters.add"
						disabled={!newName || !newAnime || newName.length < 2 || newAnime.length < 2}
					/>
				</div>
			</div>
			<div id="add">
				<h3>{$t('admin.characters.add_bulk')}</h3>
				<div id="bulk">
					<div id="input">
						<InputText
							bind:value={json}
							title={'admin.characters.multiline'}
							hint={`[
		{
			"name": "Hikari-chan",
			"anime_name": "Stay! Stay! DPRK!"
		},
		{
			"name": "XegC",
			"anime_name": "UwU in the disco"
		}
	]`}
							multiline={true}
							maxWidth={'100%'}
							height={'600px'}
						/>
					</div>
					<SolidButton
						click={async () => {
							await axios.post('/api/characters', JSON.parse(json));

							json = '';
						}}
						color="green"
						string="admin.characters.add"
						disabled={!isJSONValid(json)}
					/>
				</div>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	#title {
		display: flex;
		flex-direction: column;

		align-self: stretch;

		justify-content: space-between;

		padding: $margin-m;
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

	h3 {
		margin: $margin-m;
		margin-top: 0;
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

			padding: $margin-m;

			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: $margin-m;

			#characters {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				gap: $margin-m;

				margin-left: $margin-m;
				margin-right: $margin-m;
			}

			#add {
				width: 100%;
				max-width: calc($max-width - $margin-s * 2);

				display: flex;
				flex-direction: column;
				align-items: stretch;
			}

			#single {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				gap: $margin-m;

				margin-left: $margin-m;
				margin-right: $margin-m;

				#input {
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					gap: $margin-s;
				}
			}

			#bulk {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				gap: $margin-m;

				width: 100%;
				// max-width: calc($max-width + $margin-m * 4);

				margin-left: $margin-m;
				margin-right: $margin-m;

				#input {
					width: 100%;
					// max-width: calc($max-width + $margin-m * 2);
				}
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
