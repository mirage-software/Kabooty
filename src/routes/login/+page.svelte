<script lang="ts">
	import { afterNavigate, goto, invalidate } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';
	import { discord } from '../../stores/discord';
	import { osu } from '../../stores/osu';
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
		if (!data.signedIn) {
			discord.update(undefined);
			osu.update(undefined);
			invalidate('app:auth:signedin');
		}
	});
</script>

<div id="centered">
	<div id="content">
		<div id="header">
			<div id="decoration">
				<!-- svelte-ignore a11y-missing-attribute -->
				<img id="dec1" src="/assets/27.png" />
				<!-- svelte-ignore a11y-missing-attribute -->
				<img id="dec2" src="/assets/29.png" />
			</div>
			<div id="actions">
				{#if previousPage}
					<a class="item" href={previousPage}><i class="las la-angle-left" /></a>
				{:else}
					<div class="item" />
				{/if}
				<img class="item" src="/logo.png" alt="Endless Mirage" />
				<a class="item" href="{base}/"><i class="las la-home" /></a>
			</div>
		</div>
		<div id="login">
			<div id="text">
				<h2>{$t('login.title')}</h2>
				<p>
					{$t('login.description')}
				</p>
				<p>
					<b>{$t('login.cookie_disclaimer')}</b>
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
					><b>{$t('login.privacy')}</b></a
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
</div>

<style lang="scss">
	#centered {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		overflow-y: auto;

		@media (min-width: calc(500px + $margin-xxl * 4)) {
			justify-content: center;
			align-items: center;
		}
	}

	#content {
		background-color: $content-background-dark;
		box-shadow: $box-shadow;
		display: flex;
		flex-direction: column;
		align-items: center;

		@media (min-width: calc(500px + $margin-xxl * 4)) {
			border-radius: $border-radius-m;
			margin: $margin-xxl 0;
		}
	}

	#header {
		display: flex;
		justify-content: center;
		width: 100%;
		background: $gradient-backup;
		background: linear-gradient(90deg, $gradient-dark 0%, $gradient-light 100%);
		height: $header-height;
		position: relative;

		@media (min-width: calc(500px + $margin-xxl * 4)) {
			border-radius: $border-radius-m;
		}

		#decoration {
			position: absolute;
			height: $header-height;
			width: 100%;
			overflow: hidden;
			max-width: 500px;

			top: 0;

			display: flex;
			justify-content: space-between;

			pointer-events: none;

			opacity: 0.8;

			img {
				margin: 0;
			}

			img#dec1 {
				position: relative;
				top: -30px;
				left: -10px;
				width: 120px;
				height: 120px;
			}

			img#dec2 {
				position: relative;
				top: -30px;
				right: -15px;
				width: 120px;
				height: 120px;
			}
		}

		#actions {
			display: flex;
			justify-content: space-between;
			width: 100%;
			max-width: 500px;

			.item {
				width: calc($header-height - $margin-m * 2);
				height: calc($header-height - $margin-m * 2);
				padding: $margin-m;

				display: flex;
				align-items: center;
				justify-content: center;

				i {
					font-size: $icon-size;
				}
			}
		}
	}

	#login {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: calc(500px + $margin-xxl * 2);

		#text {
			padding: $margin-xxl;
			padding-bottom: 0;

			h2 {
				margin-bottom: $margin-m;
			}

			p {
				margin-top: $margin-xs;
			}
		}

		#privacy {
			padding: 0 $margin-xxl;
			padding-top: $margin-xs;
			display: flex;
			align-items: center;

			a {
				text-decoration: underline;
				margin-left: $margin-s;
			}
		}

		#actions {
			display: flex;
			flex-direction: row;
			padding: $margin-xxl;
			justify-content: flex-end;
		}
	}
</style>
