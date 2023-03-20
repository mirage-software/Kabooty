<script>
	import { page } from '$app/stores';
	import Error from './error.svelte';

	export let type = 'unknown';
</script>

<!-- TODO: implement new error page showing message and a nice graphic -->
<!-- functions on the page: go back a page, go to home page, check the status page -->
<!-- status page: show status of: API up, discord bot up, database up -->
<!-- also use the new default error.html sveltekit provides -->
<Error error={$page.status.toString()} />
