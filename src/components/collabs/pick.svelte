<script lang="ts">
	import type { Collab, User, Pick, AnimeCharacter, Asset, CollabAsset } from '@prisma/client';
	import Card from '../generic/design/card.svelte';
	import { t } from 'svelte-intl-precompile';

	import ImageContainer from '../generic/design/image_container.svelte';
	import IconButton from './icon_button.svelte';
	import { discord, getFormattedDate, getUserName } from '../../stores/discord';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import SolidButton from '../generic/design/solid_button.svelte';
	import { ClientPaths } from '../../utils/paths/client';
	import { goto } from '$app/navigation';

	export let pick: Pick & {
		user: User;
		character: AnimeCharacter;
		assets: (Asset & { collabAsset: CollabAsset })[];
		collab?: Collab;
	};
	export let collab: Collab;
	export let profile = false;

	let _window: Window | undefined;
	let asset: Asset | undefined;

	onMount(() => {
		_window = window;
		asset = pick.assets.find((asset) => asset.collabAsset.mainAsset);
	});

	export let onChange: () => void;

	async function deletePick() {
		if (!_window) {
			return;
		}

		let confirmed = false;
		let reason: string | null = '';

		if ($discord?.admin && pick.userId !== $discord?.id) {
			reason = _window.prompt('Whats the reason for the deletion?', 'Duplicate Pick');
			if (reason) {
				confirmed = true;
			}
		}

		if (pick.userId === $discord?.id) {
			confirmed = _window.confirm($t('collabs.delete_pick_confirm'));
		}

		if (confirmed) {
			await axios.delete('/api/picks/' + pick.id, {
				data: {
					reason: reason
				}
			});
			_window.alert('Pick Deleted');
			onChange();
		}
	}

	function isReleased(collab: Collab | undefined) {
		if (collab !== undefined && collab.status == 'RELEASE') {
			return true;
		}

		return false;
	}
</script>

<div id="card">
	<Card>
		<div id="container">
			<div>
				{#if asset}
					<div id="image">
						<ImageContainer>
							<!-- svelte-ignore a11y-missing-attribute -->
							<img
								src={ClientPaths.storedAsset(
									collab.id,
									pick.id,
									asset.collabAssetId,
									asset.image,
									asset.createdAt
								) + '&width=200&height=200'}
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
					{#if pick.character}
						<h6>{pick.character.anime_name}</h6>
					{/if}
					<h4>{pick.name}</h4>
					<h6 style="margin: 0;">Picked by</h6>
					<h5>{getUserName(pick.user)}</h5>
					<h6 id="discord-id">{pick.user.discordId}</h6>
					<h6 style="margin: 0;">Picked at</h6>
					<h5>{getFormattedDate(pick.createdAt.toString(), true)}</h5>
				</div>

				<div id="buttons">
					<div id="report">
						{#if profile && collab.allowEditing}
							<SolidButton
								click={async () => {
									goto('/collabs/' + pick.collabId + '/picks/' + pick.id + '/edit');
								}}
								string={'picks.edit'}
								color="green"
							/>
						{:else}
							<SolidButton
								click={async () => {
									goto('/collabs/' + pick.collabId + '/picks/' + pick.id);
								}}
								string={'picks.view'}
								color="green"
							/>
						{/if}
						{#if profile && isReleased(pick.collab)}
							<SolidButton
								click={async () => {
									goto('/api/picks/' + pick.id + '/delivery');
								}}
								string={'picks.delivery'}
								color="blue"
							/>
						{/if}
					</div>

					{#if $discord?.admin || profile}
						<div id="icon-buttons">
							{#if $discord?.admin || profile}
								<div id="admin">
									<IconButton icon="la la-trash" click={deletePick} />
								</div>
							{/if}
						</div>
					{/if}
				</div>
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
				justify-content: space-between;

				flex-wrap: wrap;
				gap: $margin-xs;

				width: 100%;

				#icon-buttons {
					display: flex;
					flex-direction: row;
					align-items: center;

					gap: $margin-xs;

					align-self: flex-end;
				}

				#report {
					align-self: stretch;
					display: flex;
					gap: 5px;
					justify-content: stretch;
				}

				#admin {
					display: flex;
					flex-direction: row;

					gap: $margin-xs;
				}
			}
		}
	}
</style>
