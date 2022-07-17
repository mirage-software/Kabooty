<script lang="ts">
	import { goto } from '$app/navigation';

	import { t } from 'svelte-intl-precompile';

	import { discord } from '../../stores/discord';

	import SolidButton from '../../components/generic/design/solid_button.svelte';
	import PageTitle from '../../components/generic/design/page_title.svelte';
	import AdminButton from '../../components/admin/admin_button.svelte';
	import type { AnimeCharacter, Pick, Prisma } from '@prisma/client';
	import axios from 'axios';
	import InputText from '../../components/generic/design/input_text.svelte';
	import AdminCharacter from '../../components/admin/characters/admin_character.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';
	import Paginator from '../../components/generic/design/paginator.svelte';

	let subscription: Unsubscriber | null = null;
	let initialized = false;

	let newName = '';
	let newAnime = '';
	let json = '';

	let characters: (AnimeCharacter & {
		Pick: Pick[];
	})[];
	let page = 1;
	let newPage: number | null = null;
	let query: string | undefined;
	let total = 0;

	async function getCharacters() {
		const URIQuery = encodeURIComponent(query || '');

		if (newPage) {
			page = newPage;
			newPage = null;
		}

		const response = await axios.get(
			query ? `/api/characters?search=${URIQuery}&page=${page}` : `/api/characters?page=${page}`
		);

		characters = response.data.characters;
		total = response.data.count;
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
		});
	});

	onDestroy(() => {
		if (subscription) {
			subscription();
		}
	});

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
		<div id="overview">
			<h3>{$t('admin.characters.manage')}</h3>
			<div id="characters">
				<InputText
					bind:value={query}
					title={'collabs.registration.character.name'}
					hint={'Hikari-chan uwu'}
					onChanged={() => {
						newPage = 1;
					}}
				/>
				<SolidButton
					click={getCharacters}
					color="green"
					string="collabs.registration.character.search"
				/>
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
        name: "Hikari-chan",
        anime_name: "Stay! Stay! DPRK!"
    },
    {
        name: "XegC",
        anime_name: "UwU in the disco"
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
