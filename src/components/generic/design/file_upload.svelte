<script lang="ts">
	import axios from 'axios';
	import SolidButton from './solid_button.svelte';

	let fileinput: HTMLInputElement;

	export let width = 0;
	export let height = 0;
	export let maxBytes = 0;

	export let onDataUrl = (dataUrl: string) => {};
	export let onBuffer = (buffer: ArrayBuffer, filename: string) => {};

	const onFileSelected = (e: any) => {
		let image = e.target.files[0];

		if (image.size > maxBytes) {
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
			const filename = image.name;

			if (result) {
				onBuffer(result, filename);
			}
		};

		const dataUrl = new FileReader();
		dataUrl.readAsDataURL(image);

		dataUrl.onload = (e) => {
			const result = e.target?.result as string;

			const img = new Image();
			img.src = result;

			img.onload = () => {
				if (img.width < width || img.height < height) {
					// TODO: make alerts look nice
					alert('Image is too small');
					return;
				}

				if (result) {
					onDataUrl(result);
				}
			};
		};
	};

	export let string = 'file.upload';
</script>

<input
	type="file"
	accept=".png"
	on:change={(e) => onFileSelected(e)}
	bind:this={fileinput}
	style="display: none;"
/>
<SolidButton click={async () => fileinput.click()} color="green" {string} />
