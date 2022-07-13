<script lang="ts">
	import { goto } from '$app/navigation';

	import { discord } from '../../stores/discord';

	import SolidButton from '../../components/generic/design/solid_button.svelte';
	import PageTitle from '../../components/generic/design/page_title.svelte';
	import Ongoing from '../../components/collabs/ongoing.svelte';
</script>

<div id="column">
	<div id="content">
		<div id="title">
			<PageTitle string="collabs.title" />
			{#if $discord?.admin}
				<SolidButton click={() => goto('/collabs/new')} color="green" string="collabs.create" />
			{/if}
		</div>
		<Ongoing />
	</div>
</div>

<style lang="scss">
	#column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;

		#content {
			width: 100%;
			max-width: $max-width + $margin-s * 2;

			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;

			padding-bottom: $margin-m;

			#title {
				display: flex;
				flex-direction: column;

				align-self: stretch;

				justify-content: space-between;

				padding: $margin-m;
				padding-top: $margin-l;
				padding-bottom: 0;

				gap: $margin-s;

				align-items: start;

				@media (min-width: 400px) {
					flex-direction: row;
				}
			}
		}
	}
</style>
