<script>
	import Osu from './osu.svelte';

	import Card from '../generic/design/card.svelte';
	import { t } from 'svelte-intl-precompile';
</script>

<h2>{$t('account.connections')}</h2>
<div id="osu">
	<Card>
		<Osu />
	</Card>
</div>

<style lang="scss">
	h2 {
		margin: $margin-m;
		margin-top: $margin-l;
	}

	#osu {
		margin: $margin-m;
		margin-top: 0;
		margin-bottom: 0;

		width: 100%;
		max-width: calc(100% - $margin-m * 2);
	}
</style>
