<script lang="ts">
	export let click: () => void;
	export let checked: boolean;

	function onChange() {
		const checkbox = document.getElementById('checkbox') as HTMLInputElement;

		if (checkbox) {
			checkbox.checked = checked;
		}

		click();
	}
</script>

<input id="checkbox" type="checkbox" name="checkbox" {checked} on:change={onChange} />

<style lang="scss">
	input[type='checkbox'] {
		appearance: none;
		background-color: var(--form-background);
		margin: 0;

		font: inherit;
		color: currentColor;
		width: 1.15em;
		height: 1.15em;
		border: 0.15em solid currentColor;
		border-radius: 50%;
		// transform: translateY(-0.075em);

		display: grid;
		place-content: center;
	}

	input[type='checkbox']::before {
		content: '';
		width: 0.65em;
		height: 0.65em;
		// clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
		// transform: scale(0);
		// transform-origin: bottom left;
		opacity: 0;
		transition: 120ms opacity ease-in-out;
		box-shadow: inset 1em 1em var(--form-control-color);
		/* Windows High Contrast Mode */
		background-color: $green;
		border-radius: 50%;
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
