<script lang="ts">
	import FileUpload from '../../generic/design/file_upload.svelte';

	import ImageContainer from '../../generic/design/image_container.svelte';

	import { t } from 'svelte-intl-precompile';
	import Card from '../../generic/design/card.svelte';
	import type { Asset, CollabAsset } from '@prisma/client';
	import { ClientPaths } from '../../../utils/paths/client';
	import Crop from '../../generic/design/crop.svelte';
	import { modal } from '../../../stores/modal';
	import { discord } from '../../../stores/discord';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import IconButton from '../icon_button.svelte';

	export let collabAsset: CollabAsset;
	export let asset: Asset | null = null;

	let _window: Window | undefined;

	onMount(() => {
		_window = window;
	});

	let image: string | null = null;
	let imageBuffer: ArrayBuffer;
	let filename: string;

	export let submit:
		| ((
				image: ArrayBuffer,
				filename: string,
				pixels:
					| {
							width: number;
							height: number;
							x: number;
							y: number;
					  }
					| undefined
		  ) => Promise<void>)
		| undefined = undefined;

	export let imageDeleted: () => void;

	export let editable = false;

	function cropImage(_image: string) {
		const params: any = {
			image: _image,
			width: collabAsset.assetWidth,
			height: collabAsset.assetHeight,
			upload: (_pixels: { width: number; height: number; x: number; y: number }) => {
				if (submit) {
					submit(imageBuffer, filename, _pixels);
				}
			}
		};

		if (collabAsset.example) {
			params['exampleUrl'] = ClientPaths.collabAsset(collabAsset.collabId, collabAsset.id);
		}

		modal.open(Crop, params);
	}

	async function deleteImage() {
		if (!_window || !asset) {
			return;
		}

		let confirmed = false;
		let reason: string | null = '';

		if ($discord?.admin) {
			reason = _window.prompt('Whats the reason for the deletion?', 'Inappropriate image');
			if (reason) {
				confirmed = true;
			}
		}

		if (confirmed) {
			await axios.delete(ClientPaths.deleteAsset(asset.id), {
				data: {
					reason: reason
				}
			});
			_window.alert('Asset deleted');
			imageDeleted();
		}
	}
</script>

<div id="character">
	<Card>
		{#if !editable}
			<h3>
				{collabAsset.assetName}
			</h3>
		{/if}
		<div id="content">
			{#if asset && !asset.valid}
				<h5 style="margin: 0;">
					{$t('collabs.registration.asset.invalid')}
				</h5>
			{/if}
			{#if image || asset}
				<div id="image">
					<ImageContainer>
						{#if image}
							<!-- svelte-ignore a11y-missing-attribute -->
							<img src={image} />
						{/if}
						{#if asset && !image}
							<!-- svelte-ignore a11y-missing-attribute -->
							<img
								src={ClientPaths.storedAsset(
									collabAsset.collabId,
									asset.pickId,
									collabAsset.id,
									asset.image,
									asset.createdAt
								)}
							/>
						{/if}
					</ImageContainer>
				</div>
			{/if}
			{#if editable}
				<div id="bottom">
					<FileUpload
						string={$t('collabs.registration.asset.title', {
							values: { asset: collabAsset.assetName.toLowerCase() }
						})}
						maxBytes={5120 * 1024}
						width={collabAsset.assetWidth}
						height={collabAsset.assetHeight}
						onDataUrl={(data) => {
							if (data) {
								cropImage(data);
							}
						}}
						onBuffer={(buffer, _) => {
							imageBuffer = buffer;
							filename = _;
						}}
					/>
					<div id="reqs">
						<h4>{$t('collabs.registration.character.duplicate')}</h4>
						<p id="filereqs">
							{$t('collabs.registration.asset.filereqs', {
								values: { width: collabAsset.assetWidth, height: collabAsset.assetHeight }
							})}
						</p>
					</div>
				</div>
			{/if}
			{#if $discord?.admin}
				<div id="admin">
					<IconButton icon="la la-trash-alt" click={deleteImage} />
				</div>
			{/if}
		</div>
	</Card>
</div>

<style lang="scss">
	h3 {
		margin: $margin-m;
		margin-bottom: $margin-xs;
	}

	h4 {
		margin: 0;

		color: rgba(white, 0.5);
	}

	p {
		margin: 0;

		color: rgba(white, 0.5);
	}

	#character {
		margin: $margin-m;

		max-width: 500px;

		#content {
			padding: $margin-m;

			display: flex;
			flex-direction: column;
			align-items: flex-start;
			justify-content: space-between;
			gap: $margin-m;

			height: 100%;

			#bottom {
				display: flex;
				flex-direction: column;
				align-items: flex-start;

				gap: $margin-m;
			}

			#reqs {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}

			#image {
				width: 100%;

				img {
					width: 100%;
					height: 100%;

					max-height: 400px;
					object-fit: contain;
				}
			}
		}
	}
</style>
