<script lang="ts">
	import type { Collab, User, Pick } from '@prisma/client';
	import Card from '../generic/design/card.svelte';
	import { t } from 'svelte-intl-precompile';

	import ImageContainer from '../generic/design/image_container.svelte';
	import SolidButton from '../generic/design/solid_button.svelte';
	import { goto } from '$app/navigation';
	import IconButton from './icon_button.svelte';
	import { discord, getFormattedDate } from '../../stores/discord';
	import { onMount } from 'svelte';
	import axios from 'axios';

	export let pick: Pick & { User: User };
	export let collab: Collab;
	export let profile = false;

	let _window: Window | undefined;

	onMount(() => {
		_window = window;
	});

	export let onChange: () => void;

	async function deletePick() {
		if (!_window) {
			return;
		}

		const response = _window.confirm($t('collabs.delete_pick_confirm'));

		if (response) {
			await axios.delete('/api/collabs/' + collab.id + '/picks/' + pick.id);

			onChange();
		}
	}

	async function linkPick() {
		if (!_window) {
			return;
		}

		const response = _window.prompt('Link the pick to anime character ID:', '123456');

		if (response) {
			try {
				await axios.patch('/api/collabs/' + collab.id + '/picks/' + pick.id, {
					characterId: response
				});
				onChange();
			} catch (error) {
				_window.alert('Failed to assign character');
			}
		}
	}
</script>

<div id="card">
	<Card>
		<div id="container">
			<div>
				{#if pick.image}
					<div id="image">
						<ImageContainer>
							<!-- svelte-ignore a11y-missing-attribute -->
							<img
								src={'/api/images/collabs/' +
									collab.id +
									'/picks/' +
									pick.image +
									'?width=200&height=200'}
							/>
						</ImageContainer>
					</div>
				{/if}
			</div>
			<div id="info">
				<div class="info">
					{#if profile}
						<h3>{collab.title}</h3>
					{/if}
					{#if pick.original}
						<h6>Original</h6>
					{/if}
					<h4>{pick.name}</h4>
					<h6 style="margin: 0;">Picked by</h6>
					<h5>{pick.User.username + '#' + pick.User.discriminator}</h5>
					<h6 id="discord-id">{pick.User.discordId}</h6>
					<h6 style="margin: 0;">Picked at</h6>
					<h5>{getFormattedDate(pick.createdAt.toString(), true)}</h5>
				</div>

				{#if $discord?.admin || profile}
					<div id="buttons">
						{#if $discord?.admin || profile}
							<div id="admin">
								<IconButton icon="la la-trash" click={deletePick} />
							</div>
						{/if}
						{#if $discord?.admin}
							<div id="admin">
								<IconButton icon="la la-link" click={linkPick} />
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</Card>
</div>

<style lang="scss">
	#card {
		@media (min-width: $breakpoint-s) {
			max-width: 300px;
		}

		flex-grow: 1;
	}

	#container {
		display: flex;
		flex-direction: column;

		height: 100%;

		#image {
			img {
				width: 200px;
				height: 200px;
				object-fit: cover;

				border-radius: 50%;
			}
		}

		#info {
			display: flex;
			flex-direction: column;

			margin: $margin-s;

			justify-content: flex-end;

			gap: $margin-s;

			height: 100%;

			div.info {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}

			h3,
			h4,
			h5,
			h6 {
				margin: 0;
			}

			h3,
			h4 {
				margin-bottom: $margin-xs;
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

			#discord-id {
				color: rgba($color: white, $alpha: 0.5);
			}

			#buttons {
				display: flex;
				flex-direction: row;

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
