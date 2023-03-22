<script lang="ts">
	export let checked: boolean;
</script>

<input id="checkbox" type="checkbox" name="checkbox" {checked} on:change />

<style lang="scss">
	input[type='checkbox'] {
		appearance: none;
		background-color: var(--form-background);
		margin: 0;

		font: inherit;
		color: white;
		min-width: 22px;
		height: 22px;
		border: 2px solid white;
		border-radius: 7px;
		// transform: translateY(-0.075em);

		display: grid;
		place-content: center;
	}

	input[type='checkbox']::before {
		content: '';
		width: 14px;
		height: 14px;
		// clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
		// transform: scale(0);
		// transform-origin: bottom left;
		opacity: 0;
		transition: 120ms opacity ease-in-out;
		box-shadow: inset 1em 1em var(--form-control-color);
		/* Windows High Contrast Mode */
		background-color: $green;
		border-radius: 3px;
	}

	input[type='checkbox']:checked::before {
		opacity: 1;
	}

	input[type='checkbox']:disabled {
		--form-control-color: var(--form-control-disabled);

		color: var(--form-control-disabled);
		cursor: not-allowed;
	}
</style>
