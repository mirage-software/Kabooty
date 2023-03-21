<script lang="ts">
	import type { LayoutData } from './$types';
	import Header from './components/header.svelte';

	export let data: LayoutData;
</script>

<Header url={data.auth.discord.url} />

<slot id="content" />

<style>
	#content {
		display: flex;
		justify-content: center;

		left: 0;
		right: 0;

		bottom: 0;

		width: 100%;
		min-height: 100%;
	}
</style>
