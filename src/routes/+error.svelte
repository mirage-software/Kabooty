<script>
	import { page } from '$app/stores';
	import Error from './error.svelte';

	export let type = 'unknown';
</script>

<Error error={$page.status.toString()} />
