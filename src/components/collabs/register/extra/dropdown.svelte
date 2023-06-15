<script lang="ts">
	import { t } from 'svelte-intl-precompile';

	export let title: string | null = null;
	export let placeholder = 'placeholder';

	export let value: unknown | null | undefined = '';

	export let data: unknown[] = [];
	export let strings: string[] = [];

	export let onChanged: (() => void) | null = null;
</script>

<div id="dropdown">
	{#if title}
		<h6>{$t(title)}</h6>
	{/if}
	<div id="select">
		<select name="data" bind:value on:change={onChanged}>
			{#each data as item, index}
				<option value={item}>{strings.length > index ? strings[index] : item}</option>
			{/each}
		</select>
		{#if placeholder && !value}
			<div id="wrapper">
				<p id="placeholder">{$t(placeholder)}</p>
			</div>
		{/if}
		<li class="la la-angle-down" />
	</div>
</div>

<style lang="scss">
	#wrapper {
		position: absolute;
		width: 100%;
		height: 100%;
		pointer-events: none;

		#placeholder {
			color: #ac9a99;
			position: absolute;

			top: 0;
			left: 0;
			right: 0;
			bottom: 0;

			margin-left: $margin-s;
			margin-right: calc($margin-m + $margin-s);

			display: flex;
			align-items: center;

			overflow: hidden;
			text-overflow: clip;
			white-space: nowrap;
		}
	}

	#dropdown {
		display: flex;
		flex-direction: column;
		align-items: stretch;

		align-self: stretch;

		position: relative;

		h6 {
			margin: 0;
			margin-bottom: $margin-xs;

			font-size: $font-size-caption;
		}

		width: 100%;
		max-width: 400px;

		height: 100%;

		#select {
			background-color: $dark-overlay;

			padding-right: $margin-s;

			border-radius: $border-radius-s;

			width: calc(100% - $margin-s);

			height: 100%;

			display: flex;
			align-items: center;

			li {
				color: white;
			}
		}

		select {
			appearance: none;
			border: none;
			color: white;
			font-size: $font-size-body;
			font-weight: 400;

			padding: $margin-xs;
			padding-left: $margin-s;
			padding-right: $margin-s;

			background-color: transparent;

			width: 100%;

			option {
				color: initial !important;
			}

			:active {
				border: 1px solid $dark-overlay;
			}
		}

		:focus {
			outline: none;
		}
	}
</style>
