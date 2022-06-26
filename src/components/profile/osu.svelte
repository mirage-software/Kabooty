<script lang="ts">
	import { goto } from '$app/navigation';

	import axios from 'axios';
	import { onMount } from 'svelte';
	import { canUpdateOsu } from '../../routes/api/osu/update';
	import { osu } from '../../stores/osu';
	import LoadingSpinner from '../generic/design/loading_spinner.svelte';

	import SolidButton from '../generic/design/solid_button.svelte';
	import Details from './osu/details.svelte';

	let osuRequest: Promise<void> | null = null;

	onMount(async () => {
		osuRequest = osu.fetch();

		await osuRequest;

		osuRequest = null;
	});
</script>

<div id="osu">
	{#if !osuRequest && $osu}
		<img id="avatar" src={$osu.avatar} alt="osu! avatar" />
	{/if}
	<div id="content">
		{#if osuRequest}
			<div style="align-self: center;">
				<LoadingSpinner />
			</div>
		{:else}
			<div id="title">
				<!-- svelte-ignore a11y-missing-attribute -->
				<img src="/profile/ohiostate.png" />
				<h3>osu!</h3>
			</div>

			{#if $osu}
				<Details />
			{/if}

			<div id="buttons">
				{#if !$osu}
					<SolidButton
						click={async () => {
							const state = await axios.get('/api/osu/authorize');
							goto(state.data.url);
						}}
						color="green"
						string="osu.connect"
					/>
				{/if}

				{#if $osu}
					<SolidButton
						click={async () => {
							await axios.get('/api/osu/update');
						}}
						color="green"
						string="osu.update"
						disabled={!canUpdateOsu($osu['modes'][0])}
					/>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	#osu {
		display: flex;
		flex-direction: row;
		align-items: center;

		img#avatar {
			width: 128px;
			height: 128px;

			border-radius: 50%;
			margin: $margin-m;
			margin-right: 0;

			box-shadow: $box-shadow-light;
		}
	}

	#content {
		display: flex;
		flex-direction: column;
		justify-content: start;
		align-items: start;

		padding: $margin-s;

		#title {
			display: flex;
			flex-direction: row;
			align-items: center;

			margin: $margin-s;

			img {
				height: 50px;
			}

			h3 {
				margin: 0;
				margin-left: $margin-s;
			}
		}

		#buttons {
			display: flex;
			flex-direction: row;
			align-items: center;

			gap: $margin-s;

			margin: $margin-s;
		}
	}
</style>
