<script lang="ts">
	import { t } from 'svelte-intl-precompile';

	export let onClick: () => void;

	export let title: string;
	export let description: string;
</script>

<button on:click={onClick}>
	<p id="title">{$t(title)}</p>
	<p id="description">{$t(description)}</p>
</button>

<style lang="scss">
	button {
		padding: $margin-s;
		border-radius: $border-radius-s;
		font-size: 20px;
		font-weight: 700;
		width: 300px;
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

		#title {
			font-size: $font-size-body;
			font-weight: 700;
			color: white;
		}

		#description {
			font-size: $font-size-caption;
			font-weight: 400;
			color: white;
			font-style: italic;
		}
	}

	button:hover {
		background-color: opacify($dark-overlay, $amount: 0.075);
		cursor: pointer;
	}
</style>
