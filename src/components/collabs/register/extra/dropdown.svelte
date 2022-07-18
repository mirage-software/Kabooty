<script lang="ts">
	import { t } from 'svelte-intl-precompile';

	export let title = 'title';
	export let placeholder = 'placeholder';

	export let value: string | null | undefined = '';

	export let data: string[] = [];
</script>

<div id="dropdown">
	<h6>{$t(title)}</h6>
	<div id="select">
		<select name="data" bind:value>
			<option value="">{$t(placeholder)}</option>
			{#each data as item}
				<option value={item}>{item}</option>
			{/each}
		</select>
		<li class="la la-angle-down" />
	</div>
</div>

<style lang="scss">
	#dropdown {
		display: flex;
		flex-direction: column;
		align-items: flex-start;

		h6 {
			margin: 0;
			margin-bottom: $margin-xs;

			font-size: $font-size-caption;
		}

		width: 100%;
		max-width: 400px;

		#select {
			background-color: $dark-overlay;

			padding-right: $margin-s;

			border-radius: $border-radius-s;

			width: calc(100% - $margin-s);

			display: flex;
			align-items: center;

			li {
				color: white;
			}
		}

		select {
			appearance: none;
			border: none;
			color: white;
			font-size: $font-size-body;
			font-weight: 400;

			padding: $margin-xs;
			padding-left: $margin-s;
			padding-right: $margin-s;

			background-color: transparent;

			width: 100%;

			option {
				color: initial !important;
			}

			:active {
				border: 1px solid $dark-overlay;
			}
		}

		:focus {
			outline: none;
		}
	}
</style>
