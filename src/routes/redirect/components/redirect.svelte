<script>
	import { t } from 'svelte-intl-precompile';
	import LoadingSpinner from '../../components/loading_spinner.svelte';
</script>

<div id="content">
	<h3>{$t('redirect.processing')}</h3>
	<LoadingSpinner />
</div>

<style lang="scss">
	#content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		width: 100%;
		min-height: 100%;
	}

	h3 {
		margin: $margin-xxl;
		text-align: center;
	}
</style>
