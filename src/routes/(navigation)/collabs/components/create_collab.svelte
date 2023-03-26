<script>
	import { base } from '$app/paths';
	import { t } from 'svelte-intl-precompile';
</script>

<a href="{base}/collabs/new" class="create">
	<div class="centered">
		<i class="la la-plus" />
		<h3>{$t('collabs.create_your_own')}</h3>
	</div>
</a>

<style lang="scss">
	.create {
		background-color: $card-color;
		width: 100%;
		height: 200px;
		border-radius: $border-radius-s;
		display: flex;

		transition: box-shadow 0.1s ease;

		box-shadow: $box-shadow-light;

		&:hover {
			box-shadow: $box-shadow-big !important;
		}

		.centered {
			display: flex;
			flex-direction: column;
			gap: $margin-m;
			height: calc(100% - $margin-m - $margin-s);
			width: 100%;
			padding: $margin-m;
			padding-top: $margin-s;
			border-radius: $border-radius-s;

			justify-content: center;
			align-items: center;

			i {
				font-size: 40px;
			}

			h3 {
				text-align: center;
			}
		}
	}
</style>
