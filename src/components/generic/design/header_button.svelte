<script lang="ts">
	export let route: string;
	export let string: string;
	export let icon: string;

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';

	function click() {
		goto(route);
	}
</script>

<button on:click={click} class={$page.url.pathname === route ? 'active' : 'inactive'}>
	<p>{$t('header.' + string)}</p>
	<div id="active" />
</button>

<style lang="scss">
	button {
		height: $header-height;

		background: none;
		color: white;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: none;

		border-radius: $border-radius-s;

		display: flex;
		flex-direction: column;
		justify-content: center;

		position: relative;

		p {
			font-weight: 400;
			font-size: $font-size-footer;

			margin: $margin-s;
		}
	}

	div#active {
		position: absolute;
		background-color: white;
		height: 3px;
		width: 0px;
		left: 50%;

		border-radius: 3px 3px 0 0;

		transition: width 0.2s, left 0.2s;
		transition-timing-function: ease;
		bottom: 0;
	}

	button.active > div#active {
		width: calc(100% - $margin-s * 2);
		left: $margin-s;
		align-self: flex-end;
	}

	button:hover > div#active {
		width: 10px;
		left: calc(50% - 5px);
		align-self: flex-end;
	}
</style>
