<script lang="ts">
	import Footer from '../components/footer.svelte';
	import Header from './components/header.svelte';
</script>

<div id="page">
	<Header />
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
		justify-content: stretch;
		min-height: 100vh;

		#content {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
	}
</style>
