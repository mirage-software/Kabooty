<script>
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-nocheck
	import Cropper from 'svelte-easy-crop';
	import { onMount } from 'svelte';
	import SolidButton from './solid_button.svelte';
	import { modal } from '../../../stores/modal';

	export let image;
	export let width;
	export let height;
	export let exampleUrl = undefined;
	let crop = { x: 0, y: 0 };
	let zoom = 1;
	let maxZoom = 1;

	let aspectRatio = 1;

	let pixels = {
		width: 0,
		height: 0,
		x: 0,
		y: 0
	};

	onMount(() => {
		if (width && height) {
			aspectRatio = width / height;

			const img = new Image();
			img.src = image;

			img.onload = () => {
				maxZoom = img.width / width;
				const heightRatio = img.height / height;

				if (heightRatio < maxZoom) {
					maxZoom = heightRatio;
				}
			};
		}
	});

	export let upload;
</script>

<div id="container">
	<Cropper
		{image}
		aspect={aspectRatio}
		restrictPosition={true}
		minZoom={1}
		{maxZoom}
		zoomSpeed={0.2}
		bind:crop
		bind:zoom
		on:cropcomplete={(e) => {
			pixels = e.detail.pixels;
		}}
		--example-image={exampleUrl ? 'url(' + exampleUrl + ')' : null}
	/>
</div>
<div id="buttons">
	<SolidButton
		color={'red'}
		string={'collabs.registration.asset.cancel'}
		click={async () => {
			modal.close();
		}}
	/>
	<SolidButton
		color={'green'}
		string={'collabs.registration.asset.upload'}
		click={async () => {
			if (upload) {
				console.log(pixels);
				upload(pixels);
			}

			modal.close();
		}}
	/>
</div>

<style lang="scss">
	#container {
		height: calc(100vh - 30rem);
		width: 100%;

		overflow: hidden;

		position: relative;

		background-color: rgba(0, 0, 0, 0.2);

		:global(.cropperArea) {
			background-image: var(--example-image);
			background-repeat: no-repeat;
			background-size: cover;
		}
	}

	#buttons {
		display: flex;
		flex-direction: row;
		justify-content: space-between;

		margin-top: $margin-s;
		gap: $margin-s;
	}
</style>
