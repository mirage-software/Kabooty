<script>
	import Header from './header.svelte';
</script>

<Header />

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
