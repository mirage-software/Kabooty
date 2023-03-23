<script lang="ts">
	import Footer from '../components/footer.svelte';
</script>

<div id="page">
	<div id="content">
		<slot />
	</div>
	<Footer />
</div>

<style lang="scss">
	#page {
		position: relative;
		display: flex;
		flex-direction: column;
		min-height: 100vh;

		#content {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			align-items: center;

			width: 100%;
		}
	}
</style>
