<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { onMount } from 'svelte';

	import { discord } from '../stores/discord';
	import { osu } from '../stores/osu';

	import axios from 'axios';
	import type { AnimeCharacter, Collab } from '@prisma/client';
	import LoadingSpinner from '../components/generic/design/loading_spinner.svelte';
	import Info from '../components/collabs/register/info.svelte';
	import Discord from '../components/collabs/register/discord.svelte';
	import Osu from '../components/collabs/register/osu.svelte';

	import { t } from 'svelte-intl-precompile';
	import Card from '../components/generic/design/card.svelte';
	import SolidButton from '../components/generic/design/solid_button.svelte';

	let rules: string[];

	let rulesAgreed: boolean = false;

	onMount(async () => {
		rules = (await axios.get('/api/rules')).data.split('\n');
	});

	async function startVerification() {
		await axios.get('/api/verify');
		goto('/verified');
	}
</script>

{#if !rulesAgreed}
	<div id="column">
		<div id="content">
			<!-- <Info {collab} /> -->
			<h1>{$t('server.verify')}</h1>
			{#if !$discord}
				<Discord />
			{:else if !$osu}
				<Osu />
			{:else if rules && !rulesAgreed}
				<h3>{$t('server.rules')}</h3>
				<div id="rules-card">
					<Card>
						<div id="rules-content">
							<div id="rules">
								{#each rules as rule}
									<p>{rule}</p>
								{/each}
							</div>
							<SolidButton
								click={async () => {
									rulesAgreed = true;
									startVerification();
								}}
								color="green"
								string="server.start"
							/>
						</div>
					</Card>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<LoadingSpinner />
{/if}

<style lang="scss">
	h1 {
		margin: $margin-m;
		margin-top: $margin-l;
		margin-bottom: $margin-s;
	}

	h3 {
		margin: $margin-m;
		margin-top: $margin-s;
		margin-bottom: 0;
	}

	p {
		margin: 0;

		min-height: $margin-s;
	}

	#column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;

		#content {
			width: 100%;
			max-width: $max-width + $margin-s * 2;

			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;

			#rules-card {
				align-self: stretch;
				margin: $margin-m;

				display: flex;
				flex-direction: column;
				justify-content: flex-start;
				align-items: flex-start;

				#rules-content {
					display: flex;
					flex-direction: column;
					gap: $margin-m;
					align-items: flex-start;
					padding: $margin-m;

					#rules {
						padding: $margin-m;
						background-color: $dark-overlay;
						align-self: stretch;

						border-radius: $border-radius-s;
					}
				}
			}
		}
	}
</style>
