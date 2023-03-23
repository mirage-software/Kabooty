<script lang="ts">
	export let link: {
		id: string;
		route: string;
		string: string;
		icon: string;
	};

	import { page } from '$app/stores';
	import { t } from 'svelte-intl-precompile';
	import { base } from '$app/paths';

	export let type: 'sidebar' | 'header';
</script>

<a
	on:click
	class:active={$page.route.id === link.id}
	class:sidebar={type === 'sidebar'}
	class:header={type === 'header'}
	href={`${base}${link.route}`}
>
	<div id="active" />
	{#if type === 'sidebar'}
		<i id="icon" class="las la-{link.icon}" />
	{/if}
	<p>{$t('header.' + link.string)}</p>
</a>

<style lang="scss">
	a {
		background: none;
		border-radius: $border-radius-s;
		display: flex;

		p {
			font-weight: 400;
			font-size: $font-size-footer;

			margin: $margin-s;
		}

		#icon {
			font-size: $icon-size;
			margin-left: $margin-s;
		}

		div#active {
			position: absolute;
			background-color: white;
			opacity: 0;
			transition-timing-function: ease;
		}

		&.sidebar {
			height: 50px;
			width: calc(100% - $margin-xs * 2);
			margin: $margin-xs;
			margin-top: 0;

			flex-direction: row;
			justify-content: stretch;
			align-items: center;

			background-color: rgba(255, 255, 255, 0.05);

			div#active {
				border-radius: 0 3px 3px 0;
				height: 0px;
				width: 3px;
				left: 0;
				transition: height 0.2s, opacity 0.2s;
			}

			&.active div#active {
				height: 50px - $margin-s * 2;
			}

			&.active > div#active {
				opacity: 1 !important;
			}
		}

		&.header {
			height: $header-height;
			flex-direction: column;
			justify-content: center;
			position: relative;

			div#active {
				height: 3px;
				width: 0px;
				left: 50%;
				border-radius: 3px 3px 0 0;
				transition: width 0.2s, left 0.2s, opacity 0.2s;
				bottom: 0;
			}

			&.active > div#active {
				width: calc(100% - $margin-s * 2);
				left: $margin-s;
				opacity: 1 !important;
			}

			&:hover > div#active {
				width: 10px;
				left: calc(50% - 5px);
				opacity: 1;
			}
		}
	}
</style>
