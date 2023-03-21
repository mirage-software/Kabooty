<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';
	import { discord } from '../../stores/discord';
	import PrimaryButton from '../components/buttons/primary_button.svelte';
	import Checkbox from '../components/checkbox.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: agreed = false;

	let previousPage: string | undefined;

	afterNavigate(({ from }) => {
		previousPage = from?.url.pathname;
	});

	onMount(() => {
		if ($discord) {
			goto(previousPage ?? base + '/');
		}
	});
</script>

<div id="content">
	<div id="login">
		<div id="header">
			{#if previousPage}
				<a class="item" href={previousPage}><i class="las la-angle-left" /></a>
			{:else}
				<div class="item" />
			{/if}
			<img class="item" src="/logo.png" alt="Endless Mirage" />
			<a class="item" href="{base}/"><i class="las la-home" /></a>
		</div>
		<div id="text">
			<h2>{$t('login.title')}</h2>
			<p>
				{@html $t('login.description')}
			</p>
		</div>
		<div id="privacy">
			<Checkbox
				bind:checked={agreed}
				on:change={(_) => {
					agreed = !agreed;
				}}
			/>
			<a href="{base}/privacy" class="privacy" target="_blank" rel="noreferrer"
				>{$t('login.privacy')}</a
			>
		</div>
		<div id="actions">
			<PrimaryButton
				on:click={() => {
					if (agreed) {
						goto(data.auth.discord.url);
					}
				}}
				disabled={!agreed}
				content={$t('login.title')}
			/>
		</div>
	</div>
</div>

<style lang="scss">
	#privacy {
		display: flex;

		a {
			text-decoration: underline;
			margin-left: $margin-xs;
		}
	}

	$breakpoint-login: 420px;

	#content {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		@media (min-width: $breakpoint-login) {
			padding: $margin-m;
		}
	}

	#login {
		display: flex;
		flex-direction: column;

		@media (min-width: $breakpoint-login) {
			border-radius: $border-radius-m;
		}

		width: 100%;
		max-width: 500px;
		background: $decoration-fill;
		background: linear-gradient(90deg, $gradient-dark 0%, $gradient-light 100%);
		box-shadow: $box-shadow;

		#header {
			display: flex;
			justify-content: space-between;

			.item {
				width: 50px;
				height: 50px;
				padding: 20px;

				display: flex;
				align-items: center;
				justify-content: center;

				i {
					font-size: $icon-size;
				}
			}
		}

		#text {
			padding: 0 $margin-m;

			h2 {
				margin: 0;
			}

			p {
				margin: 0;
				margin-top: $margin-xs;
			}
		}

		#privacy {
			padding: 0 $margin-m;
			padding-top: $margin-s;

			h2 {
				margin: 0;
			}

			p {
				margin: 0;
				margin-top: $margin-xs;
			}
		}

		#actions {
			display: flex;
			flex-direction: row;
			padding: $margin-m;
			justify-content: flex-end;
		}
	}
</style>
