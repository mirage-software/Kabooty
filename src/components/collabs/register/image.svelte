<script lang="ts">
	import FileUpload from '../../generic/design/file_upload.svelte';

	import ImageContainer from '../../generic/design/image_container.svelte';

	import { t } from 'svelte-intl-precompile';
	import Card from '../../generic/design/card.svelte';
	import SolidButton from '../../generic/design/solid_button.svelte';
	import type { Asset, CollabAsset } from '@prisma/client';
	import { ClientPaths } from '../../../utils/paths/client';
	import Crop from '../../generic/design/crop.svelte';
	import { modal } from '../../../stores/modal';

	export let collabAsset: CollabAsset;
	export let asset: Asset | null = null;

	let image: string | null = null;
	let imageBuffer: ArrayBuffer;
	let filename: string;

	export let submit: (
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
	) => Promise<void>;

	export let next: () => void;

	export let editing = false;

	function cropImage(_image: string) {
		const params: any = {
			image: _image,
			width: collabAsset.assetWidth,
			height: collabAsset.assetHeight,
			upload: (_pixels: { width: number; height: number; x: number; y: number }) => {
				submit(imageBuffer, filename, _pixels);
			}
		};

		if (collabAsset.example) {
			params['exampleUrl'] = ClientPaths.collabAsset(collabAsset.collabId, collabAsset.id);
		}

		modal.open(Crop, params);
	}
</script>

<h3>
	{$t('collabs.registration.asset.title', {
		values: { asset: collabAsset.assetName.toLowerCase() }
	})}
</h3>
<div id="character">
	<Card>
		<div id="content">
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
				<h4 class={editing ? 'editing' : ''}>{$t('collabs.registration.character.duplicate')}</h4>
				<p class={editing ? 'editing' : ''} id="filereqs">
					{$t('collabs.registration.asset.filereqs', {
						values: { width: collabAsset.assetWidth, height: collabAsset.assetHeight }
					})}
				</p>
			</div>
			{#if asset || image}
				<SolidButton
					click={async () => {
						next();
					}}
					color="green"
					string="collabs.registration.submit"
				/>
			{/if}
		</div>
	</Card>
</div>

<style lang="scss">
	h3 {
		margin: $margin-m;
		margin-top: $margin-s;
	}

	h4 {
		margin: 0;
	}

	p {
		margin: 0;
	}

	#character {
		margin: $margin-m;
		margin-top: 0;
		margin-bottom: $margin-m;

		width: 100%;
		max-width: calc(100% - $margin-m * 2);

		#content {
			padding: $margin-m;

			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: $margin-m;

			#reqs {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}

			#image {
				width: 100%;

				max-width: 500px;

				img {
					width: 100%;
					object-fit: contain;
				}
			}
		}
	}
</style>
