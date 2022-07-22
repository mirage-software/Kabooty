<script lang="ts">
	import { t } from 'svelte-intl-precompile';
</script>

<div>
	<i class="las la-check-circle" />
	<h2>{$t('server.verified')}</h2>
</div>

<style lang="scss">
	div {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: calc(100% - $margin-m * 2);
		max-width: $max-width;
		margin: $margin-m;
		margin-top: $margin-l;
	}

	i {
		margin-bottom: $margin-m;
		font-size: 40pt;
		color: white;
	}

	h2 {
		margin: 0;
		margin-bottom: $margin-s;

		text-align: center;
	}
</style>
