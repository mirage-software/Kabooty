<script lang="ts">
	import { page } from '$app/stores';
	import { t } from 'svelte-intl-precompile';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import SolidButton from '../../generic/design/solid_button.svelte';
	import Card from '../../generic/design/card.svelte';
	import { discord } from '../../../stores/discord';

	function getCurrentRoute() {
		return $page.url.pathname;
	}
</script>

<h3>{$t('collabs.registration.connect.discord')}</h3>
<div id="discord">
	<Card>
		<div id="content">
			<p>{$t('collabs.registration.connect.discord_description')}</p>
			<SolidButton
				click={async () => {
					const state = await axios.get('/api/discord/authorize');
					discord.setRedirectUrl(getCurrentRoute());
					goto(state.data.url);
				}}
				color="green"
				string="header.signin"
			/>
		</div>
	</Card>
</div>

<style lang="scss">
	h3 {
		margin: $margin-m;
		margin-top: $margin-s;
	}

	p {
		margin: 0;
	}

	#discord {
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
