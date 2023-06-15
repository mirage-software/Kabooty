<script lang="ts">
	import { goto } from '$app/navigation';

	import axios from 'axios';
	import { onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';
	import { canUpdateOsu } from '../../routes/api/osu/update/can_update';
	import { osu } from '../../stores/osu';
	import LoadingSpinner from '../generic/design/loading_spinner.svelte';

	import SolidButton from '../generic/design/solid_button.svelte';
	import Details from './osu/details.svelte';
	import ModeButton from './osu/mode_button.svelte';

	let osuRequest: Promise<void> | null = null;

	onMount(async () => {
		osuRequest = osu.fetch();

		await osuRequest;

		osuRequest = null;
	});

	function flagUrl(code: string) {
		const baseFileName = code
			.split('')
			.map((c) => (c.charCodeAt(0) + 127397).toString(16))
			.join('-');

		return `https://osu.ppy.sh/assets/images/flags/${baseFileName}.svg`;
	}
</script>

<div id="osu">
	<!-- svelte-ignore a11y-missing-attribute -->
	<img id="logo" src="/profile/osu.png" />
	{#if !osuRequest && $osu !== null && $osu !== undefined}
		<div id="connection">
			<img id="avatar" src={$osu.avatar} alt="osu! avatar" />

			<p id="username">{$osu.username}</p>

			<div id="country">
				<img src={flagUrl($osu.country)} alt={$osu.country} />
				<p>{$osu.country}</p>
			</div>
		</div>
	{/if}
	<div id="content">
		{#if osuRequest}
			<div style="align-self: center;">
				<LoadingSpinner />
			</div>
		{:else}
			{#if $osu !== null && $osu !== undefined}
				<Details />
			{/if}

			<div id="buttons">
				{#if $osu === null || $osu === undefined}
					<SolidButton
						click={async () => {
							const state = await axios.get('/api/osu/authorize');
							goto(state.data.url);
						}}
						color="green"
						string="osu.connect"
					/>
				{/if}

				{#if $osu !== null && $osu !== undefined}
					<SolidButton
						click={async () => {
							const user = await axios.get(`/api/osu/update/${$osu?.modes[0].gamemode}`);
							osu.update(user.data);
						}}
						color="green"
						string="osu.update"
						disabled={!canUpdateOsu($osu['modes'][0])}
					/>

					<div id="modeswitcher">
						<div>
							<ModeButton icon="osu" />
							<ModeButton icon="taiko" />
						</div>
						<div>
							<ModeButton icon="fruits" />
							<ModeButton icon="mania" />
						</div>
					</div>
				{/if}
			</div>
			<p id="note">
				{$t('osu.note', {
					values: {
						days: 2
					}
				})}
			</p>
		{/if}
	</div>
</div>

<style lang="scss">
	#osu {
		display: flex;
		flex-direction: column;

		position: relative;

		z-index: 5;

		overflow: hidden;

		border-radius: $border-radius-s;

		@media (min-width: 770px) {
			flex-direction: row;
		}

		#logo {
			position: absolute;

			opacity: 0.1;

			bottom: -45px;
			right: -10px;

			z-index: -1;
		}

		#connection {
			background-color: $dark-overlay;

			display: flex;
			flex-direction: column;

			padding: $margin-m;

			border-radius: $border-radius-s;

			align-items: center;

			@media (min-width: 770px) {
				align-items: flex-start;
			}

			img#avatar {
				width: 128px;
				height: 128px;

				border-radius: 50%;

				box-shadow: $box-shadow-light;

				align-self: center;
			}

			p#username {
				margin: 0;

				margin-top: $margin-s;

				font-size: $font-size-body;
				font-weight: 700;
			}

			div#country {
				display: flex;

				align-items: center;

				margin-top: $margin-xs;

				img {
					width: 30px;
				}

				p {
					margin: 0;
					margin-left: $margin-s;

					font-size: $font-size-caption;
				}
			}
		}
	}

	#content {
		display: flex;
		flex-direction: column;
		justify-content: end;
		align-items: start;

		padding: $margin-s;

		#buttons {
			display: flex;
			flex-direction: row;
			align-items: center;

			gap: $margin-s;

			margin: $margin-s;

			flex-wrap: wrap-reverse;

			#modeswitcher {
				display: flex;
				flex-direction: row;

				gap: $margin-xs;

				flex-wrap: wrap;
			}
		}

		#note {
			margin: $margin-s;
			margin-top: 0;

			font-size: $font-size-caption;
			font-weight: 400;
			color: rgba($color: white, $alpha: 0.5);
		}
	}
</style>
