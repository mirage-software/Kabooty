<script lang="ts">
	import type { CollabAsset } from '@prisma/client';
	import axios from 'axios';

	import { createEventDispatcher, onMount } from 'svelte';
	import Checkbox from '../../routes/components/checkbox.svelte';

	const dispatch = createEventDispatcher<{ delete: string; edit: string; main: string }>();

	async function click(event: 'delete' | 'edit' | 'main') {
		dispatch(event);
	}

	export let collabAsset: Partial<CollabAsset>;
	export let manage = false;

	let _window: Window | null = null;

	onMount(async () => {
		_window = window;
	});

	async function uploadExample(buffer: ArrayBuffer) {
		const x = _window?.prompt(
			'Please define the x position of the image. This indicates where the cropping tool will place the image to crop in the example image. (numbers only)',
			'0'
		);

		const y = _window?.prompt(
			'Please define the y position of the image. This indicates where the cropping tool will place the image to crop in the example image. (numbers only)',
			'0'
		);

		collabAsset = (
			await axios.post(
				`/api/collabs/${collabAsset.collabId}/assets/${collabAsset.id}/example`,
				buffer,
				{
					params: {
						x,
						y
					}
				}
			)
		).data;
	}

	async function deleteExample() {
		collabAsset = (
			await axios.delete(`/api/collabs/${collabAsset.collabId}/assets/${collabAsset.id}/example`)
		).data;
	}

	let fileinput: HTMLInputElement;

	const onFileSelected = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		let image: File | null = null;

		if (e.currentTarget && e.currentTarget['files'] && e.currentTarget['files'].length > 0) {
			image = e.currentTarget['files'][0];
		}

		if (!image || image === null) {
			return;
		}

		if (image.size > 5120 * 1024) {
			alert('File is too large');
			return;
		}

		if (image.type !== 'image/png') {
			alert('Only PNG files are supported');
			return;
		}

		const buffer = new FileReader();
		buffer.readAsArrayBuffer(image);

		buffer.onload = (e) => {
			const result = e.target?.result as ArrayBuffer;

			if (result) {
				uploadExample(result);
			}
		};
	};
</script>

<input
	type="file"
	accept=".png"
	on:change={(e) => onFileSelected(e)}
	bind:this={fileinput}
	style="display: none;"
/>

<div class="asset">
	{#if manage}
		<Checkbox
			checked={collabAsset.mainAsset ?? false}
			on:change={() => {
				click('main');
			}}
		/>
	{/if}
	<div id="content">
		<div class="name">{collabAsset.assetName ?? 'No name set'}</div>
		<div class="dimensions">
			<!-- TODO: add to translations -->
			{collabAsset.assetWidth ?? '??'}px width and {collabAsset.assetHeight ?? '??'}px height
		</div>
		{#if manage && collabAsset.id}
			<div class="example">
				Example {#if collabAsset.example}<button on:click={deleteExample}>delete</button>
				{/if}<button on:click={() => fileinput.click()}>upload</button>
				{#if collabAsset.example}<p class="position">
						x{collabAsset.exampleX} y{collabAsset.exampleY}
					</p>{/if}
			</div>
		{/if}
	</div>
	{#if manage}
		<button on:click={() => click('delete')} id="delete">
			<i class="las la-trash-alt" />
		</button>
		<button on:click={() => click('edit')} id="edit">
			<i class="las la-pencil-alt" />
		</button>
	{/if}
</div>

<style lang="scss">
	.asset {
		display: flex;
		flex-direction: row;
		align-items: center;

		gap: $margin-s;

		background-color: $dark-overlay;

		padding: $margin-s;
		padding-top: $margin-xs;
		padding-bottom: $margin-xs;
		border-radius: $border-radius-s;

		color: white;

		button {
			width: 35px;
			height: 35px;

			background-color: transparent;

			border-radius: 50%;
			border: none;
			cursor: pointer;

			color: white;

			font-size: $font-size-body;

			display: flex;
			align-items: center;
			justify-content: center;
		}

		#delete {
			margin-left: auto;
		}

		#content {
			display: flex;
			flex-direction: column;
			align-items: flex-start;

			.name {
				font-weight: bold;
				margin: 0;
			}

			.dimensions {
				font-size: $font-size-caption;
				font-style: italic;
				margin: 0;
			}

			.example {
				font-size: $font-size-caption;
				margin: 0;

				button {
					font-size: inherit;
					display: inline;
					width: auto;
					height: auto;
					padding: 0;

					font-style: italic;

					&:hover {
						text-decoration-line: underline;
					}
				}

				.position {
					display: inline;

					font-weight: bold;
				}
			}
		}
	}
</style>
