<script>
	import { t } from 'svelte-intl-precompile';

	export let string = '';
</script>

<h1>{$t(string)}</h1>

<style>
	h1 {
		margin: 0;
	}
</style>
