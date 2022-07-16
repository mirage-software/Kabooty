<script lang="ts">
	import { t } from 'svelte-intl-precompile';
	import { page } from '$app/stores';
	import SolidButton from '../../../components/generic/design/solid_button.svelte';
	import { goto } from '$app/navigation';

	const id = $page.params.id;

	const url = `/collabs/${id}/register`;

	const error = $page.url.searchParams.get('error');
</script>

<div>
	<i class="las la-skull-crossbones" />
	<h2>{$t('collabs.' + error)}</h2>

	<SolidButton color="green" string="collabs.retry" click={() => goto(url)} />
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
		margin-bottom: $margin-l;

		text-align: center;
	}
</style>
