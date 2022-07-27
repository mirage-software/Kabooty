<script lang="ts">
	import { page } from '$app/stores';
	import Card from '../generic/design/card.svelte';
	import { t } from 'svelte-intl-precompile';
	import SolidButton from '../generic/design/solid_button.svelte';
	import type { Collab } from '@prisma/client';
	import axios from 'axios';
	import InputText from '../generic/design/input_text.svelte';
	import FileUpload from '../generic/design/file_upload.svelte';
	import ImageContainer from '../generic/design/image_container.svelte';
	import { goto } from '$app/navigation';
	import CollabCard from './collab.svelte';
	import Dropdown from './register/extra/dropdown.svelte';

	export let collab: Partial<Collab> = {
		title: undefined,
		topic: undefined
	};

	let image: string | null = null;
	let imageBuffer: ArrayBuffer | null = null;
	let filename: string | null = null;

	let statusOptions = ['OPEN', 'BUMP', 'RELEASE', 'CLOSED', 'EARLY_ACCESS', 'DESIGN'];
	let statusStrings = statusOptions.map((status) => $t(`collabs.status.${status}`));

	async function onSave() {
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
				<InputText bind:value={collab.topic} title={'collabs.manage.topic'} hint={'Hotwheels'} />
				<Dropdown
					bind:value={collab.status}
					title={'collabs.manage.status'}
					data={statusOptions}
					strings={statusStrings}
					placeholder={'collabs.manage.status'}
				/>
				<div id="logo">
					{#if (collab && collab.logo) || image}
						<div id="image">
							<ImageContainer>
								<!-- svelte-ignore a11y-missing-attribute -->
								<img src={image ? image : '/api/images/collabs/' + collab?.logo} />
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
					collab.title.length < 5 ||
					collab.topic.length < 4}
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

						max-width: 600px;
					}

					#image {
						margin-bottom: $margin-s;
					}
				}

				#filereqs {
					margin: 0;
				}
			}
		}
	}
</style>
