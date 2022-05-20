<script context="module">
	/** @type {import('@sveltejs/kit').Load} */
	// @ts-ignore
	export function load({ error, status }) {
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

	export let status = 200;
	export let type = 'unknown';
</script>

<Error {status} {type} />
