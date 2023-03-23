<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { base } from '$app/paths';
	import { t } from 'svelte-intl-precompile';
	import AlertButton from './components/buttons/alert_button.svelte';
	import PrimaryButton from './components/buttons/primary_button.svelte';

	async function setCookiesAccepted() {
		await fetch(`${base}/api/cookies/accept`, {
			method: 'PATCH'
		});
		invalidate('app:cookies:notice');
	}

	async function setCookiesDeclined() {
		await fetch(`${base}/api/cookies/decline`, {
			method: 'PATCH'
		});
		invalidate('app:cookies:notice');
	}
</script>

<div id="cookienotice">
	<div class="content">
		<div class="disclaimer">
			<h3>{$t('cookies.title')}</h3>
			<p>{$t('cookies.description')}</p>
			<p>{$t('cookies.usage')}</p>
			<a href="{base}/cookies">{$t('cookies.link')}</a>
		</div>
		<div id="button">
			<AlertButton on:click={setCookiesDeclined} content={$t('cookies.decline')} />
			<PrimaryButton on:click={setCookiesAccepted} content={$t('cookies.accept')} />
		</div>
	</div>
</div>

<style lang="scss">
	#cookienotice {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;

		max-height: 100vh;
		overflow-x: auto;

		background: $gradient-backup;
		background: linear-gradient(90deg, $gradient-dark 0%, $gradient-light 100%);
		box-shadow: $box-shadow;

		display: flex;
		justify-content: center;

		.content {
			display: flex;
			flex-direction: column;

			gap: $margin-xxl;

			@media (min-width: $breakpoint-s) {
				flex-direction: row;
				align-items: flex-end;
			}

			width: 100%;
			max-width: $max-width;
			margin: $margin-xxl;

			h3 {
				margin-bottom: $margin-xs;
			}

			p {
				margin-bottom: $margin-xs;
			}

			a {
				text-decoration: underline;
			}

			#button {
				width: 100%;
				gap: $margin-s;
				display: flex;
				flex-direction: column;

				@media (min-width: $breakpoint-xs) {
					width: auto;
					flex-direction: row;
				}
			}
		}
	}
</style>
