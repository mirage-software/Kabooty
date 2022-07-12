<script lang="ts">
	export let click: () => void;

	export let icon = 'la la-automobile';
</script>

<button on:click={click}>
	<div class={icon} />
</button>

<style lang="scss">
	button {
		padding: $margin-s;
		border-radius: $border-radius-s;
		font-size: 20px;
		font-weight: 700;

		border: 1px solid $dark-overlay;

		background-color: transparent;

		div {
			display: flex;
			justify-content: center;
			align-items: center;

			color: white;
		}
	}

	button:hover {
		background-color: rgba(0, 0, 0, 0.075);
		cursor: pointer;
	}
</style>
