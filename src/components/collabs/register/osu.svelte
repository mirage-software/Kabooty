<script lang="ts">
	import { page } from '$app/stores';
	import { t } from 'svelte-intl-precompile';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import SolidButton from '../../generic/design/solid_button.svelte';
	import Card from '../../generic/design/card.svelte';
	import { osu } from '../../../stores/osu';

	function getCurrentRoute() {
		return $page.url.pathname;
	}
</script>

<h3>{$t('collabs.registration.connect.osu')}</h3>
<div id="osu">
	<Card>
		<div id="content">
			<h4>{$t('collabs.registration.connect.osu_description')}</h4>
			<SolidButton
				click={async () => {
					// TODO: abstract into data layer
					const state = await axios.get('/api/auth/osu/url');
					osu.setRedirectUrl(getCurrentRoute());
					goto(state.data.url);
				}}
				color="green"
				string="osu.connect"
			/>
		</div>
	</Card>
</div>

<style lang="scss">
	h3 {
		margin: $margin-m;
		margin-top: $margin-s;
	}

	h4 {
		margin: 0;
	}

	#osu {
		margin: $margin-m;
		margin-top: 0;
		margin-bottom: $margin-m;

		width: 100%;
		max-width: calc(100% - $margin-m * 2);

		#content {
			padding: $margin-m;

			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: $margin-m;
		}
	}
</style>
