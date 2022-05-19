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
	<i id="icon" class="las la-{icon}" />
	<p>{$t('header.' + string)}</p>
	<div id="active" />
</button>

<style lang="scss">
	button {
		height: $header-height;
		margin-left: $margin-xs;

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
		justify-content: flex-end;

		position: relative;

		#icon {
			font-size: $icon-size;
			line-height: $margin-xs;
			margin-bottom: $margin-xs * 1.5;
		}

		p {
			text-transform: uppercase;
			font-weight: 700;
			font-size: $font-size-caption;

			margin: $margin-s;
			margin-top: 0px;
			margin-bottom: $margin-s - 6px;
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
	}

	button.active > div#active {
		width: calc(100% - $margin-s * 2);
		left: $margin-s;
	}

	button:hover > div#active {
		width: 10px;
		left: calc(50% - 5px);
	}
</style>
