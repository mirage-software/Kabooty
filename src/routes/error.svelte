<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';

	export let status: number = 200;
	// export let error: any;
	export let type = 'unknown';
</script>

<div>
	<i class="las la-exclamation-circle" />
	<h2>{$t('errors.title')}</h2>
	{#each $t('errors.' + type).split('<br>') as line}
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
