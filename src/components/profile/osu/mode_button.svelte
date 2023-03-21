<script lang="ts">
	import axios from 'axios';
	import { osu, type IOsuUser } from '../../../stores/osu';

	async function updateGamemode() {
		if ($osu && $osu.modes[0].gamemode !== icon) {
			try {
				const user = await axios.get<IOsuUser>(`/api/auth/osu/update/${icon}`);
				osu.update(user.data);
			} catch (error) {
				osu.update(null);
			}
		}
	}

	export let icon = 'osu';
</script>

<button class:selected={$osu?.modes[0].gamemode === icon} on:click={updateGamemode}>
	<div class="icon-mode-{icon}" />
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

	.selected {
		background-color: $dark-overlay !important;
	}

	button:hover {
		background-color: rgba(0, 0, 0, 0.075);
		cursor: pointer;
	}

	button:hover.selected {
		cursor: default !important;
	}
</style>
