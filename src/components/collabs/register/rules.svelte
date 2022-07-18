<script lang="ts">
	import { page } from '$app/stores';
	import { t } from 'svelte-intl-precompile';
	import SolidButton from '../../generic/design/solid_button.svelte';
	import Card from '../../generic/design/card.svelte';
	import type { Collab } from '@prisma/client';

	export let collab: Collab;

	export let accept: () => Promise<void> = async () => {};

	function getRules(): string[] {
		if (!collab.rules) {
			return [];
		}

		return collab.rules.split(/\n/g);
	}
</script>

<h3>{$t('collabs.registration.rules')}</h3>
<div id="rules">
	<Card>
		<div id="content">
			<h4>{$t('collabs.registration.rules_description')}</h4>
			<div id="rules-content">
				{#each getRules() as rule}
					<p>{rule}</p>
				{/each}
			</div>
			<SolidButton click={accept} color="green" string="collabs.registration.rules_accept" />
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

	p {
		margin: 0;
	}

	#rules {
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

			#rules-content {
				display: flex;

				flex-direction: column;
				gap: calc($margin-xs / 4);

				max-width: 500px;
				width: calc(100% - $margin-m * 2);

				background-color: $dark-overlay;
				padding: $margin-s;

				border-radius: $border-radius-s;

				p {
					color: white;
					white-space: break-spaces;
					text-overflow: ellipsis;
					overflow: hidden;
					text-align: left;
				}
			}
		}
	}
</style>
