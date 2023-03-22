<script lang="ts">
	import Header from './components/header.svelte';
</script>

<Header />

<div id="content">
	<slot />
</div>

<style>
	#content {
		display: flex;
		justify-content: center;

		width: 100%;
		min-height: 100%;
	}
</style>
