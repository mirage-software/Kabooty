<script lang="ts">
	import { page } from '$app/stores';
	import Card from '../generic/design/card.svelte';
	import { t } from 'svelte-intl-precompile';
	import SolidButton from '../generic/design/solid_button.svelte';
	import type { Collab, CollabAsset } from '@prisma/client';
	import axios from 'axios';
	import InputText from '../generic/design/input_text.svelte';
	import FileUpload from '../generic/design/file_upload.svelte';
	import ImageContainer from '../generic/design/image_container.svelte';
	import { goto } from '$app/navigation';
	import CollabCard from './collab.svelte';
	import Dropdown from './register/extra/dropdown.svelte';
	import Asset from './asset.svelte';
	import { onMount } from 'svelte';
	import { toKebabCase } from '../../utils/text/toKebabCase';

	export let collab: Partial<Collab & { collabAssets: CollabAsset[] }> = {
		title: undefined,
		topic: undefined,
		collabAssets: []
	};

	let collabAssets: Partial<CollabAsset>[] = [];

	let image: string | null = null;
	let imageBuffer: ArrayBuffer | null = null;
	let filename: string | null = null;
	let uniqueURL = false;
	let error: string | null | undefined = null;
	let original_url: string | null | undefined = collab.url;

	let statusOptions = ['OPEN', 'RELEASE', 'CLOSED', 'EARLY_ACCESS', 'DESIGN'];
	let statusStrings = statusOptions.map((status) => $t(`collabs.status.${status}`));

	let bumpStatusOptions = ['ENABLED', 'DISABLED'];
	let bumpStatusStrings = bumpStatusOptions.map((status) => $t(`collabs.bump_status.${status}`));

	let allowEditOptions = [true, false];
	let allowEditStrings = allowEditOptions.map((status) => (status ? 'Yes' : 'No'));

	let _window: Window | null = null;

	onMount(async () => {
		_window = window;
		collabAssets = collab.collabAssets || [];
		checkUniqueURL();
	});

	let deletedAssetIds: string[] = [];

	async function deleteAsset(index: number) {
		const asset = collabAssets.at(index);

		if (!asset) {
			return;
		}

		if (asset.id) {
			const confirmed = _window?.confirm(
				'This will delete all files collected for this asset. Are you sure?'
			);

			if (!confirmed) {
				return;
			}

			deletedAssetIds.push(asset.id);
		}

		collabAssets.splice(index, 1);

		if (asset.mainAsset && collabAssets.at(0)) {
			collabAssets[0].mainAsset = true;
		}

		// !! hack to trigger svelte reactivity
		collabAssets = [...collabAssets];
	}

	async function addOrChangeAsset(index: number | undefined = undefined) {
		let asset: Partial<CollabAsset> | undefined;

		if (index !== undefined) {
			asset = collabAssets.at(index);
		}

		if (!asset) {
			asset = {
				collabId: collab.id,
				mainAsset: collabAssets.length === 0
			};
		}

		if (!asset.assetType) {
			const type = _window?.prompt(
				'Please define the type of asset. This will be used to store the files. This is permanent and cannot be changed! Example: (profile_picture) or (banner_character) without the ().',
				'avatar'
			);
			if (type) {
				asset.assetType = type
					.replace(' ', '_')
					.toLowerCase()
					.replace(/[^a-z0-9_]/gi, '');
			} else {
				return;
			}
		}

		const name = _window?.prompt(
			'Please define the name of the asset. This will be visible to the user.',
			asset.assetName ?? 'Avatar'
		);
		if (name) {
			asset.assetName = name;
		} else {
			return;
		}

		const height = _window?.prompt(
			'Please define the height of the asset. This will be used for image selection and resizing. (numbers only)',
			asset.assetHeight?.toString() ?? '300'
		);
		if (height) {
			asset.assetHeight = parseInt(height);
		} else {
			return;
		}

		const width = _window?.prompt(
			'Please define the width of the asset. This will be used for image selection and resizing. (numbers only)',
			asset.assetWidth?.toString() ?? '300'
		);
		if (width) {
			asset.assetWidth = parseInt(width);
		} else {
			return;
		}

		if (index !== undefined) {
			collabAssets[index] = asset;
		} else {
			collabAssets.push(asset);
		}

		// !! hack to trigger svelte reactivity
		collabAssets = [...collabAssets];
	}

	async function checkUniqueURL() {
		collab.url = toKebabCase(collab.url);
		const URIQuery = encodeURIComponent(collab.url || '');

		const response = await axios.get(`/api/url?search=${URIQuery}`);

		uniqueURL = response.data;

		if (uniqueURL === false && collab.url !== original_url) {
			error = 'This url is already being used';
			uniqueURL = false;
		} else {
			error = null;
			uniqueURL = true;
		}
	}

	async function onSave() {
		collab.url = toKebabCase(collab.url);

		if (!collab.id) {
			collab = (await axios.post('/api/collabs', collab)).data;
		} else {
			collab = (await axios.put(`/api/collabs/${collab.id}`, collab)).data;
		}

		if (image && imageBuffer) {
			await axios.post(`/api/images/upload/collabs/${collab.id}/${filename}`, imageBuffer, {
				headers: {
					'Content-Type': 'application/octet-stream'
				}
			});
		}

		for (let i = 0; i < deletedAssetIds.length; i++) {
			const assetId = deletedAssetIds[i];

			axios.delete(`/api/collabs/${collab.id}/assets/${assetId}`);
		}

		for (let i = 0; i < collabAssets.length; i++) {
			const asset = collabAssets[i];

			if (asset.id) {
				await axios.put(`/api/collabs/${collab.id}/assets/${asset.id}`, asset);
			} else {
				await axios.post(`/api/collabs/${collab.id}/assets`, asset);
			}
		}

		if ($page.url.pathname.endsWith('/new')) {
			goto(`/collabs/${collab.id}/manage`);
		}
	}
</script>

<h1>{collab.id ? $t('collabs.update') : $t('collabs.create')}</h1>
<div id="manage">
	<Card>
		<div id="content">
			<div id="manage-card">
				<InputText
					bind:value={collab.title}
					title={'collabs.manage.name'}
					hint={'Endless Mirage Megacollab'}
				/>
				<InputText
					bind:value={collab.url}
					title={'collabs.manage.url'}
					onChanged={checkUniqueURL}
					hint={'6th'}
					{error}
				/>
				<InputText bind:value={collab.topic} title={'collabs.manage.topic'} hint={'Hotwheels'} />
				<Dropdown
					bind:value={collab.status}
					title={'collabs.manage.status'}
					data={statusOptions}
					strings={statusStrings}
					placeholder={'collabs.manage.status'}
				/>
				<Dropdown
					bind:value={collab.bumpStatus}
					title={'collabs.manage.bump_status'}
					data={bumpStatusOptions}
					strings={bumpStatusStrings}
					placeholder={'collabs.manage.bump_status'}
				/>
				<Dropdown
					bind:value={collab.allowEditing}
					title={'Allow editing'}
					data={allowEditOptions}
					strings={allowEditStrings}
					placeholder={'Manage edit permission'}
				/>
				<div id="logo">
					{#if (collab && collab.logo) || image}
						<div id="image">
							<ImageContainer>
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src={image ? image : '/api/assets/collabs/' + collab?.logo} />
							</ImageContainer>
						</div>
					{/if}
					<FileUpload
						string="collabs.manage.logo"
						maxBytes={1024 * 1024}
						width={300}
						height={100}
						onDataUrl={(data) => (image = data)}
						onBuffer={(buffer, _) => {
							imageBuffer = buffer;
							filename = _;
						}}
					/>
					<p id="filereqs">{$t('collabs.manage.filereqs')}</p>
				</div>
				<div id="assets">
					{#if collabAssets.length > 0}
						<div id="list">
							{#each collabAssets as asset, index}
								<Asset
									collabAsset={asset}
									manage={true}
									on:main={() => {
										if (collabAssets) {
											collabAssets.forEach((asset) => {
												asset.mainAsset = false;
											});
											collabAssets[index].mainAsset = true;
										}
									}}
									on:delete={() => deleteAsset(index)}
									on:edit={() => addOrChangeAsset(index)}
								/>
							{/each}
						</div>
					{/if}

					<SolidButton
						click={addOrChangeAsset}
						color="green"
						string={'collabs.manage.assets.add'}
						disabled={!collab.title ||
							!collab.topic ||
							!collab.status ||
							collab.title.length < 5 ||
							collab.topic.length < 4}
					/>
					<p id="assetreqs">{$t('collabs.manage.assets.reqs')}</p>
				</div>
				<div id="rules">
					<InputText
						bind:value={collab.rules}
						multiline={true}
						title={'collabs.manage.rules'}
						hint={'- No cheese allowed\n- User must have played with barbie dolls at least once'}
					/>
				</div>
			</div>
			<SolidButton
				click={onSave}
				color="green"
				string={collab.id ? $t('collabs.update') : $t('collabs.create')}
				disabled={!collab.title ||
					!collab.topic ||
					!collab.status ||
					!collab.bumpStatus ||
					!collab.collabAssets ||
					collab.title.length < 5 ||
					collab.topic.length < 4 ||
					collab.collabAssets.length < 1 ||
					!collab.collabAssets.find((asset) => asset.mainAsset) ||
					!uniqueURL}
			/>
		</div>
	</Card>

	<div id="collabcard">
		<CollabCard {collab} dataUrl={image} />
	</div>
</div>

<style lang="scss">
	h1 {
		margin: $margin-m;
		margin-top: $margin-l;
	}

	#collabcard {
		@media (min-width: $breakpoint-s) {
			max-width: 360px;
		}

		width: 100%;
	}

	#manage {
		margin: $margin-m;
		margin-top: 0;
		margin-bottom: $margin-m;

		width: 100%;
		max-width: calc(100% - $margin-m * 2);

		display: flex;
		flex-direction: column;

		gap: $margin-m;

		@media (min-width: $breakpoint-s) {
			flex-direction: row;
		}

		#content {
			padding: $margin-m;

			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: $margin-l;

			#manage-card {
				display: flex;

				flex-direction: column;

				gap: $margin-s;

				align-items: flex-start;

				margin: 0;

				width: 100%;

				#rules {
					margin-top: $margin-m;
					width: 100%;
				}

				#logo {
					display: flex;

					flex-direction: column;

					gap: $margin-s;

					align-items: flex-start;

					margin-top: $margin-m;

					img {
						width: 100%;

						max-width: 400px - $margin-s * 2;
					}

					#image {
						margin-bottom: $margin-s;
					}
				}

				#filereqs {
					margin: 0;
				}

				#assets {
					display: flex;

					flex-direction: column;

					gap: $margin-s;

					align-items: flex-start;

					margin-top: $margin-m;

					#list {
						display: flex;
						flex-direction: column;
						gap: $margin-xs;
						align-items: stretch;

						width: 100%;
						max-width: 400px;
					}
				}

				#assetreqs {
					margin: 0;
				}
			}
		}
	}
</style>
