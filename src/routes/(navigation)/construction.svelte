<script lang="ts">
	import { t } from 'svelte-intl-precompile';
</script>

<div>
	<i class="las la-exclamation-triangle" />
	<h2>{$t('errors.construction.title')}</h2>
	{#each $t('errors.construction.body').split('<br>') as line}
		<p>{line}</p>
	{/each}
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

	p {
		margin: 0;
		margin-top: $margin-xs;

		max-width: 500px;

		text-align: justify;
		text-justify: auto;
		text-align-last: center;
	}
</style>
