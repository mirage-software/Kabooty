<script lang="ts">
	import { page } from '$app/stores';

	export let pageCount: number;

	let currentPage = 1;

	function getPagesFromCurrentPage(_page: number, _pageCount: number): number[] {
		let lowerBoundary = _page - 2;
		let upperBoundary = _page + 2;

		const pages: number[] = [];

		while (lowerBoundary < 2) {
			lowerBoundary++;
			upperBoundary++;
		}

		while (upperBoundary >= _pageCount) {
			upperBoundary--;
		}

		console.log(lowerBoundary, upperBoundary);

		if (upperBoundary === lowerBoundary) {
			return [];
		}

		for (let i = lowerBoundary; i <= upperBoundary; i++) {
			pages.push(i);
		}

		return pages;
	}

	function setPage(page: number) {
		if (page < 1) {
			currentPage = 1;
		} else if (page > pageCount) {
			currentPage = pageCount;
		} else {
			currentPage = page;
		}

		if (updatePage) {
			updatePage(currentPage);
		}
	}

	export let updatePage: (page: number) => void;
</script>

<div id="paginator">
	<button id="left" on:click={() => setPage(currentPage - 1)}>
		<div class="la la-angle-left" />
	</button>
	<button id="page" class:selected={currentPage === 1} on:click={() => setPage(1)}>1</button>
	{#each getPagesFromCurrentPage(currentPage, pageCount) as page}
		<button id="page" class:selected={currentPage === page} on:click={() => setPage(page)}
			>{page}</button
		>
	{/each}
	{#if pageCount > 1}
		<button id="page" class:selected={currentPage === pageCount} on:click={() => setPage(pageCount)}
			>{pageCount}</button
		>
	{/if}
	<button id="right" on:click={() => setPage(currentPage + 1)}>
		<div class="la la-angle-right" />
	</button>
</div>

<style lang="scss">
	#paginator {
		display: flex;
		justify-content: start;
		align-items: center;

		background-color: $dark-overlay;
		border-radius: $border-radius-s;
		overflow: hidden;

		button {
			height: 40px;
			min-width: 40px;
			border: none;
			background: none;
			outline: none;
			cursor: pointer;

			flex-grow: 1;

			padding-left: $margin-xs;
			padding-right: $margin-xs;

			background-color: transparent;
			color: white;

			border-radius: $border-radius-s;

			&.selected {
				background-color: opacify($dark-overlay, $amount: 0.15) !important;
			}

			&:hover {
				background: opacify($dark-overlay, $amount: 0.075);
				cursor: pointer;
			}
		}
	}
</style>
