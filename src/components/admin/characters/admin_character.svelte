<script lang="ts">
	import type { AnimeCharacter, Pick } from '@prisma/client';
	import axios from 'axios';

	import { t } from 'svelte-intl-precompile';
	import IconButton from '../../collabs/icon_button.svelte';
	import { onMount } from 'svelte';

	export let character: AnimeCharacter & {
		picks: Pick[];
	};

	let _window: Window | null = null;

	onMount(async () => {
		_window = window;
	});

	export let onDelete: () => void;

	async function deleteCharacter() {
		await axios.delete('/api/characters?id=' + character.id);
		onDelete();
	}

	async function editCharacter() {

		const name = _window?.prompt(
			'Character Name',
			character.name ?? ''
		);
		if (name) {
			character.name = name;
		} else {
			return;
		}

		const anime_name = _window?.prompt(
			'Series name',
			character.anime_name ?? ''
		);

		if (anime_name) {
			character.anime_name = anime_name;
		} else {
			return;
		}

		await axios.post(`/api/characters/${character.id}/edit`, character);
	}

</script>

<div id="character">
	{#if character.picks.length > 0}
		<p id="status">
			{$t('admin.characters.in_use')}
		</p>
	{/if}
	<p id="id">ID: {character.id}</p>
	<p id="name">{character?.name}</p>
	<p id="anime">{character?.anime_name}</p>
	<div id="buttons">
		<IconButton icon="la la-trash" click={deleteCharacter} />
		<IconButton icon="las la-pencil-alt" click={editCharacter} />
	</div>
</div>

<style lang="scss">
	div#character {
		padding: $margin-s;
		border-radius: $border-radius-s;
		font-size: 20px;
		font-weight: 700;
		flex-grow: 1;

		border: 1px solid $dark-overlay;

		background-color: $dark-overlay;

		display: flex;
		flex-direction: column;
		align-items: flex-start;

		p {
			margin: 0;
			text-align: left;
		}

		#status {
			font-size: $font-size-caption;
			color: white !important;
			margin-bottom: $margin-xs;
		}

		#id {
			font-size: $font-size-caption;
			font-weight: 400;
			font-style: italic;
			color: white !important;
		}

		#name {
			font-size: $font-size-body;
			font-weight: 700;
			color: white;
		}

		#anime {
			font-size: $font-size-caption;
			font-weight: 400;
			color: white;
			font-style: italic;
		}

		#buttons {
			display: flex;
			flex-direction: row;
			gap: 5px;

			margin-top: $margin-s;
		}
	}
</style>
