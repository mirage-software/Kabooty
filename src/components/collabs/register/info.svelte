<script lang="ts">
	import type { Collab } from '@prisma/client';
	import { t } from 'svelte-intl-precompile';

	export let collab: Collab;
</script>

<div id="info">
	<h1>{$t('collabs.registration.title')}</h1>
	<h4>{collab.title}</h4>
	<h5>{collab.topic}</h5>
</div>

<style lang="scss">
	#info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;

		margin: $margin-m;

		h1 {
			margin: 0;
			margin-top: $margin-m;
			margin-bottom: $margin-s;
		}

		h4,
		h5 {
			margin: 0;
		}

		h5 {
			font-size: $font-size-caption;
			font-weight: 400;
			color: rgba($color: white, $alpha: 0.5);
		}
	}
</style>
