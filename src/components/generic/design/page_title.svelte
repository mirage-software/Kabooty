<script lang="ts">
	import { t } from 'svelte-intl-precompile';

	export let string: string | null = null;
	export let value: string | null = null;
</script>

{#if string || value}
	<h1>{string ? $t(string) : value}</h1>
{/if}

<style>
	h1 {
		margin: 0;
	}
</style>
