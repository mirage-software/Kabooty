<script lang="ts">
	import { t } from 'svelte-intl-precompile';

	export let title: string | null = null;
	export let hint = 'hint';

	export let value: string | null | undefined = '';

	export let multiline = false;

	export let max: number | null | undefined = null;

	export let maxWidth: string | null | undefined = null;
	export let height: string | null | undefined = null;

	function getMultilineStyle(
		_maxWidth: string | null | undefined,
		_height: string | null | undefined
	) {
		let style = '';

		if (_maxWidth) {
			style += `max-width: ${_maxWidth} !important;`;
		}

		if (_height) {
			style += `height: ${_height} !important;`;
		}

		return style;
	}

	export let onChanged: (() => void) | null = null;
</script>

<div id="text" style={getMultilineStyle(maxWidth, null)}>
	{#if title}
		<h6>{$t(title)}</h6>
	{/if}
	{#if multiline}
		<textarea
			id="input"
			placeholder={$t(hint)}
			bind:value
			on:input={onChanged}
			style={getMultilineStyle(maxWidth, height)}
		/>
	{:else}
		<input
			type="text"
			maxlength={max}
			id="input"
			placeholder={$t(hint)}
			on:input={onChanged}
			bind:value
		/>
	{/if}
</div>

<style lang="scss">
	div#text {
		h6 {
			margin: 0;
			margin-bottom: $margin-xs;

			font-size: $font-size-caption;

			text-align: start;
		}

		width: 100%;
		max-width: 400px;

		display: flex;
		flex-direction: column;
		align-items: flex-start;

		input,
		textarea {
			border: none;
			background-color: $dark-overlay;
			color: white;
			font-size: $font-size-body;
			font-weight: 400;

			padding: $margin-xs;
			padding-left: $margin-s;
			padding-right: $margin-s;

			border-radius: $border-radius-s;

			resize: none;

			width: calc(100% - $margin-s * 2);
			height: 100%;

			:active {
				border: 1px solid $dark-overlay;
			}
		}

		textarea {
			overflow: scroll;
			height: 200px;
		}

		:focus {
			outline: none;
		}
	}
</style>
