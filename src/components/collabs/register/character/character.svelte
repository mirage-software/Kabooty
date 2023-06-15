<script lang="ts">
	import type { AnimeCharacter, Pick } from '@prisma/client';

	import { selected } from './selected_store';

	import { t } from 'svelte-intl-precompile';

	export let character: AnimeCharacter & { picks: Pick[] };

	export let onClick: ((character: AnimeCharacter) => void) | null = null;
</script>

<button
	class:selected={character?.id === $selected?.id}
	class:unavailable={character?.id === -1 ? false : character.picks.length > 0}
	on:click={() => {
		if (character.picks.length === 0) {
			if (onClick) {
				onClick(character);
			}
		}
	}}
>
	{#if character?.id !== -1}
		<p id="status">
			{character.picks.length > 0
				? $t('collabs.registration.character.picked')
				: $t('collabs.registration.character.available')}
		</p>
	{/if}
	<p id="name">{character?.name}</p>
	<p id="anime">{character?.anime_name}</p>
</button>

<style lang="scss">
	button {
		padding: $margin-s;
		border-radius: $border-radius-s;
		font-size: 20px;
		font-weight: 700;
		width: 200px - $margin-s;
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
	}

	.selected {
		background-color: opacify($dark-overlay, $amount: 0.15) !important;
	}

	.unavailable {
		background-color: opacify($dark-overlay, $amount: 0.3) !important;
		cursor: default !important;

		p {
			color: rgba($color: white, $alpha: 0.4) !important;
		}
	}

	button:hover {
		background-color: opacify($dark-overlay, $amount: 0.075);
		cursor: pointer;
	}

	button:hover.selected {
		cursor: default !important;
	}
</style>
