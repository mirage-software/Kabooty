<script lang="ts">
	import { t } from 'svelte-intl-precompile';

	export let title = 'title';
	export let hint = 'hint';

	export let value: string = '';
</script>

<div>
	<h6>{$t(title)}</h6>
	<input type="text" name={$t(title)} id="input" placeholder={$t(hint)} bind:value />
</div>

<style lang="scss">
	div {
		h6 {
			margin: 0;
			margin-bottom: $margin-xs;

			font-size: $font-size-caption;
		}

		width: 100%;
		max-width: 400px;

		input {
			border: none;
			background-color: $dark-overlay;
			color: white;
			font-size: $font-size-body;
			font-weight: 400;

			padding: $margin-xs;
			padding-left: $margin-s;
			padding-right: $margin-s;

			border-radius: $border-radius-s;

			width: calc(100% - $margin-s * 2);

			:active {
				border: 1px solid $dark-overlay;
			}
		}

		:focus {
			outline: none;
		}
	}
</style>
