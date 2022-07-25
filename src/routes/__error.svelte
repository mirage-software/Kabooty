<script context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export function load({ error, status }) {
		console.error(error);

		return {
			props: {
				status: status,
				// error: error,
				type: status?.toString()
			}
		};
	}
</script>

<script>
	import Error from './error.svelte';

	export let type = 'unknown';
</script>

<Error {type} />
