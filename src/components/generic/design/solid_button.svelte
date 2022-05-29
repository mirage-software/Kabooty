<script lang="ts">
	import { t } from 'svelte-intl-precompile';

	export let string: string;
	export let decoration: string | undefined = undefined;
	export let color: 'green' | 'blue' | 'red' = 'green';
	export let click: () => void;
</script>

<button on:click={click} class={color}>
	<p>{$t(string)}</p>
	{#if decoration}
		<!-- svelte-ignore a11y-missing-attribute -->
		<img src={decoration} />
	{/if}
</button>

<style lang="scss">
	button.green {
		background-color: $green;
	}

	button.red {
		background-color: $red;
	}

	button.blue {
		background-color: $blue;
	}

	button:hover.green {
		background-color: darken($green, 5%);
	}

	button:hover.red {
		background-color: darken($red, 10%);
	}

	button:hover.blue {
		background-color: darken($blue, 5%);
	}

	button {
		background: none;
		color: white;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: none;

		border-radius: $border-radius-s;

		display: flex;
		flex-direction: row;
		justify-content: stretch;
		align-items: center;

		box-shadow: $box-shadow-light;
		transition: background-color 0.1s ease-in-out;

		p {
			font-weight: 400;
			font-size: $font-size-footer;

			margin: $margin-s;
		}
	}
</style>
