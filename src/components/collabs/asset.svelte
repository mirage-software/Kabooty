<script lang="ts">
	import type { CollabAsset } from '@prisma/client';

	import { createEventDispatcher } from 'svelte';
	import Checkbox from '../generic/design/checkbox.svelte';

	const dispatch = createEventDispatcher<{ delete: string; edit: string; main: string }>();

	async function click(event: 'delete' | 'edit' | 'main') {
		dispatch(event);
	}

	export let collabAsset: Partial<CollabAsset>;
	export let manage = false;
</script>

<div class="asset">
	{#if manage}
		<Checkbox
			checked={collabAsset.mainAsset ?? false}
			click={() => {
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
		}
	}
</style>
