<script lang="ts">
	import type { AnimeCharacter, Pick } from '@prisma/client';
	import axios from 'axios';

	import { t } from 'svelte-intl-precompile';
	import IconButton from '../../collabs/icon_button.svelte';

	export let character: AnimeCharacter & {
		Pick: Pick[];
	};

	export let onDelete: () => void;

	async function deleteCharacter() {
		await axios.delete('/api/characters?id=' + character.id);
		onDelete();
	}

	const picked = character.Pick.length > 0;
</script>

<div id="character">
	{#if picked}
		<p id="status">
			{$t('admin.characters.in_use')}
		</p>
	{/if}
	<p id="name">{character?.name}</p>
	<p id="anime">{character?.anime_name}</p>
	<div id="buttons">
		<IconButton icon="la la-trash" click={deleteCharacter} />
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

			margin-top: $margin-s;
		}
	}
</style>
