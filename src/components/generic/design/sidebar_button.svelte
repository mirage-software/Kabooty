<script lang="ts">
	export let route: string;
	export let string: string;
	export let icon: string;

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';

	let active = false;

	onMount(async () => {
		if ($page.url.pathname === route) {
			active = true;
		}
	});

	function click() {
		goto(route);
	}
</script>

<button on:click={click} class={active ? 'active' : 'inactive'}>
	<div id="active" />
	<i id="icon" class="las la-{icon}" />
	<p>{$t('header.' + string)}</p>
</button>

<style lang="scss">
	div#active {
		position: absolute;
		background-color: white;
		height: 50px - $margin-s * 2;
		width: 0px;
		left: 50%;

		border-radius: 0 3px 3px 0;

		transition: width 0.2s, left 0.2s;
		transition-timing-function: ease;
	}

	button.active div#active {
		width: 3px;
		left: 0;
	}

	button {
		height: 50px;
		width: calc(100% - $margin-xs * 2);
		margin: $margin-xs;
		margin-top: 0;

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

		background-color: rgba(0, 0, 0, 0.1);

		#icon {
			font-size: $icon-size;
			margin-left: $margin-s;
		}

		p {
			text-transform: uppercase;
			font-weight: 700;
			font-size: $font-size-caption;

			margin: $margin-s;
		}
	}
</style>
