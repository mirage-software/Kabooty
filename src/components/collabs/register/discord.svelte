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
			<div id="permissions">
				{#each $t('discord.permissions').split('<br>') as line}
					{#if !line.startsWith('- ')}
						<h4>{line}</h4>
					{:else}
						<p>{line}</p>
					{/if}
				{/each}
			</div>
			<SolidButton
				click={async () => {
					const state = await axios.get('/api/discord/authorize');
					discord.setRedirectUrl(getCurrentRoute());
					goto(state.data.url);
				}}
				color="green"
				string="discord.signin"
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

	h4 {
		margin: 0;
		margin-bottom: $margin-s;
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
