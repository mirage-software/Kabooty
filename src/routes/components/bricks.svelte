<script lang="ts">
	import Masonry from 'masonry-layout';
	import imagesLoaded from 'imagesloaded';
	import { onMount, onDestroy } from 'svelte';

	let removeOngoing = false;
	let elementsPending: Element[] = [];
	let pendingElementsAdded = true;

	export function remove(elements: Element[]) {
		if (grid?.remove && grid?.layout) {
			removeOngoing = true;
			grid.remove(elements);
			grid.layout();
		}
	}

	let layoutAfterAppended = false;

	export function append(elements: Element[]) {
		if (removeOngoing) {
			elementsPending.push(...elements);
			pendingElementsAdded = false;
			return;
		}

		if (pendingElementsAdded) {
			layoutAfterAppended = true;
		}
		pendingElementsAdded = true;
		const _grid = document.querySelector('#generic-masonry');

		for (let i = 0; i < elements.length; i++) {
			_grid?.append(elements[i]);
		}

		if (grid?.appended) {
			grid.appended(elements);
		}

		imagesLoaded('#generic-masonry', { background: true }, () => {
			if (grid?.layout) {
				layoutAfterAppended = true;
				grid.layout();
			}
		});
	}

	let grid: Masonry | undefined;

	onMount(() => {
		grid = new Masonry('#generic-masonry', {
			itemSelector: '#masonry-grid-item',
			percentPosition: true,
			columnWidth: '#masonry-grid-sizer',
			gutter: 8,
			initLayout: true
		});

		if (grid.on) {
			grid.on('removeComplete', () => {
				removeOngoing = false;
				if (grid?.layout) {
					grid.layout();
				}
			});

			grid.on('layoutComplete', () => {
				if (elementsPending.length !== 0 && !removeOngoing && !pendingElementsAdded) {
					append(elementsPending);
					elementsPending = [];
				}

				if (grid?.layout && layoutAfterAppended) {
					layoutAfterAppended = false;
					grid.layout();
				}
			});
		}

		imagesLoaded('#generic-masonry', { background: true }, () => {
			if (grid?.layout) {
				grid.layout();
			}
		});
	});

	onDestroy(() => {
		if (grid?.destroy) {
			grid.destroy();
		}
	});
</script>

<div id="generic-masonry">
	<div id="masonry-grid-sizer" />
	<slot />
</div>

<style lang="scss">
	/* clear fix */
	#generic-masonry:after {
		content: '';
		display: block;
		clear: both;
	}

	#masonry-grid-sizer {
		display: none;
	}

	#generic-masonry {
		display: flex;
		align-items: flex-start;
		gap: $margin-xs;
		flex-wrap: wrap;
	}
</style>
