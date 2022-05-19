<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';

	let active = false;

	onMount(async () => {
		//
	});

	function click() {
		goto('/register');
	}
</script>

<button on:click={click}>
	<p>{$t('header.signin')}</p>
	<div id="user">
		<i id="icon" class="las la-user" />
	</div>
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
		flex-direction: row;
		align-items: center;

		#user {
			height: $header-height - $margin-s * 2;
			width: $header-height - $margin-s * 2;

			margin: $margin-s;

			border: 1px solid white;
			border-radius: 50%;

			display: flex;

			justify-content: center;
			align-items: center;

			#icon {
				font-size: $icon-size;
				margin-bottom: 3px;
			}
		}

		p {
			text-transform: uppercase;
			font-weight: 700;
			font-size: $font-size-caption;

			display: none;

			@media (min-width: $breakpoint-m) {
				display: block;
			}
		}
	}
</style>
