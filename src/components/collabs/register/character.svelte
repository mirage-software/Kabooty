<script lang="ts">
	import { t } from 'svelte-intl-precompile';
	import SolidButton from '../../generic/design/solid_button.svelte';
	import Card from '../../generic/design/card.svelte';
	import type { AnimeCharacter, Collab, Pick } from '@prisma/client';
	import axios from 'axios';
	import InputText from '../../generic/design/input_text.svelte';
	import Character from './character/character.svelte';
	import { selected } from './character/selected_store';

	export let collab: Collab;

	export let submit: (data: AnimeCharacter | null | undefined) => Promise<void>;

	let results: (AnimeCharacter & { Pick: Pick[] })[] | null = null;

	let query = '';
	let custom = true;

	async function searchCharacters() {
		if (query.length < 2 || !collab?.id) {
			return;
		}

		results = (await axios.get(`/api/collabs/${collab.id}/characters?search=${query}`)).data;
	}
</script>

<h3>{$t('collabs.registration.character.pick')}</h3>
<div id="character">
	<Card>
		<div id="content">
			<div>
				<h4>{$t('collabs.registration.character.search_title')}</h4>
				<h5>{$t('collabs.registration.character.search_subtitle')}</h5>
			</div>
			<InputText
				bind:value={query}
				title={$t('collabs.registration.character.name')}
				hint={'Yumiko'}
			/>
			<SolidButton
				click={searchCharacters}
				color="green"
				string="collabs.registration.character.search"
				disabled={query.length < 2}
			/>
			{#if results}
				<div id="results">
					{#each results as result}
						<Character
							character={result}
							onClick={() => {
								custom = false;
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
						onClick={() => {
							custom = true;
						}}
					/>
				</div>
			{/if}
			{#if $selected}
				<SolidButton
					click={async () => submit($selected)}
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
