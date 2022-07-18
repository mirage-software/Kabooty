<script lang="ts">
	import type { Collab } from '@prisma/client';
	import Card from '../generic/design/card.svelte';
	import { t } from 'svelte-intl-precompile';

	import ImageContainer from '../generic/design/image_container.svelte';
	import SolidButton from '../generic/design/solid_button.svelte';
	import { goto } from '$app/navigation';
	import IconButton from './icon_button.svelte';
	import { discord } from '../../stores/discord';
	import { onMount } from 'svelte';
	import axios from 'axios';

	export let dataUrl: string | null = null;
	export let collab: Partial<Collab> | null = null;

	let canRegister: boolean = false;

	onMount(async () => {
		if (!collab?.id) {
			canRegister = true;
			return;
		}

		try {
			await axios.get('/api/collabs/' + collab.id + '/open');
			canRegister = true;
		} catch (error) {
			canRegister = false;
		}
	});
</script>

{#if collab}
	<div id="card">
		<Card>
			<div id="container">
				{#if collab.id}
					<div id="view-absolute">
						<button
							on:click={collab?.id
								? () => {
										if (collab?.id) {
											goto('/collabs/' + collab.id.toString());
										}
								  }
								: null}
							id="view"
						>
							<i class="las la-external-link-alt" />
						</button>
					</div>
				{/if}
				<div>
					{#if dataUrl || collab.logo}
						<div id="image">
							<ImageContainer>
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src={dataUrl ? dataUrl : '/api/images/collabs/' + collab?.logo} />
							</ImageContainer>
						</div>
					{/if}
				</div>
				<div id="info">
					<div class="info">
						{#if collab.status}
							<h6>{$t('collabs.status.' + collab.status)}</h6>
						{/if}
						<h4>{collab.title}</h4>
						<h5>{collab.topic}</h5>
					</div>
					{#if canRegister || $discord?.admin}
						<div id="buttons">
							{#if canRegister}
								<SolidButton
									color="green"
									click={async () => {
										if (collab?.id) {
											goto(`/collabs/${collab.id}/register`);
										}
									}}
									string={$t('collabs.register')}
								/>
							{/if}
							{#if $discord?.admin}
								<div id="admin">
									<IconButton
										icon="la la-pencil"
										click={() => {
											if (collab?.id) {
												goto(`/collabs/${collab.id}/manage`);
											}
										}}
									/>
									<IconButton
										icon="la la-trash"
										click={() => {
											alert('Not implemented yet');
										}}
									/>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</Card>
	</div>
{/if}

<style lang="scss">
	#card {
		@media (min-width: $breakpoint-s) {
			max-width: 360px;
		}

		flex-grow: 1;
	}

	#view-absolute {
		display: flex;
		position: relative;

		#view {
			position: absolute;

			right: 0;

			margin: calc($margin-s * 1.5);

			width: 35px;
			height: 35px;

			background-color: rgba($color: black, $alpha: 0.3);

			border-radius: 50%;
			border: none;
			cursor: pointer;

			color: white;

			font-size: $font-size-body;

			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	#container {
		display: flex;
		flex-direction: column;

		height: 100%;

		#image {
			img {
				width: 100%;
			}
		}

		#info {
			display: flex;
			flex-direction: column;

			margin: $margin-s;

			justify-content: space-between;

			gap: $margin-s;

			height: 100%;

			div.info {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}

			h4,
			h5,
			h6 {
				margin: 0;
			}

			h5 {
				font-size: $font-size-caption;
				font-weight: 400;
				color: rgba($color: white, $alpha: 0.5);
			}

			h6 {
				margin-bottom: $margin-xs;
				font-weight: 700;
				color: white;
				font-style: italic;
			}

			#buttons {
				display: flex;
				flex-direction: row;

				justify-content: space-between;

				position: relative;

				z-index: 10;

				flex-wrap: wrap;
				gap: $margin-xs;

				width: 100%;

				#admin {
					display: flex;
					flex-direction: row;

					gap: $margin-xs;
				}
			}
		}
	}
</style>
