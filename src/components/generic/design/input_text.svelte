<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';

	export let title: string | null = null;
	export let hint = 'hint';

	export let value: string | null | undefined = '';
	export let valid: boolean | undefined = undefined;

	export let multiline = false;

	export let max: number | null | undefined = null;

	export let maxWidth: string | null | undefined = null;
	export let height: string | null | undefined = null;

	export let calculation: {
		font: string | undefined;
		weight: number | undefined;
		italic: boolean | undefined;
		size: number | undefined;
		width: number | undefined;
	} = {} as any;

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

	function changed(e: any) {
		value = e.target.value;

		if (browser) {
			validate();
		}

		if (onChanged) {
			onChanged();
		}
	}

	function getTextWidth(text: string, font: string) {
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');

		if (!context) {
			return -1;
		}

		context.font = font;
		const metrics = context.measureText(text);
		canvas.remove();
		return metrics.width;
	}

	async function getCanvasFont() {
		const fontWeight = calculation.weight?.toString() || '400';
		const fontSize = calculation.size ? calculation.size.toString() + 'px' : '16px';
		const fontFamily = calculation.font || 'Times New Roman';

		const WebFont = await import('webfontloader');

		WebFont.load({
			google: {
				families: [fontFamily + ':' + (calculation.italic ? fontWeight + 'italic' : fontWeight)]
			}
		});

		if (calculation.italic) {
			return `italic normal ${fontWeight} ${fontSize} ${fontFamily}`;
		}
		return `${fontWeight} ${fontSize} ${fontFamily}`;
	}

	async function validate() {
		if (calculation.width) {
			const width = getTextWidth(value ?? '', await getCanvasFont());

			valid = width <= calculation.width;
		}
	}

	onMount(() => {
		validate();
	});
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
			on:input={changed}
			style={getMultilineStyle(maxWidth, height)}
		/>
	{:else}
		<input
			type="text"
			maxlength={max}
			id="input"
			placeholder={$t(hint)}
			on:input={changed}
			{value}
		/>
	{/if}
	{#if valid === false}
		<h6 id="invalid">{$t('errors.text_too_long')}</h6>
	{/if}
</div>

<style lang="scss">
	div#text {
		h6 {
			margin: 0;
			margin-bottom: $margin-xs;

			font-size: $font-size-caption;

			text-align: start;

			&#invalid {
				margin-bottom: 0;
				margin-top: $margin-xs;
				color: rgba(white, 0.5);
				font-style: italic;
			}
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
