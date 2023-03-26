<script lang="ts">
	export let disabled = false;
	export let loading = false;
	export let content: string | undefined;
</script>

<button on:click class:disabled class:loading>
	{content}
</button>

<style lang="scss">
	button {
		font-size: $font-size-body;
		border: none;
		padding: 12px 32px;
		border-radius: 5px;
		box-shadow: 0px 6px 0px 0px $green-disabled;
		color: white;
		background: $green;
		cursor: pointer;
		transition: top 0.16s, background 0.16s, box-shadow 0.16s;
		position: relative;
		top: 0;
		margin-bottom: 6px;
		height: 50px;
		width: 100%;
	}

	.disabled {
		background: $green-disabled;
		box-shadow: 0px 0px 0px 0px $green-disabled !important;
		top: 6px !important;
		cursor: unset !important;
	}

	.loading {
		$duration: 1.4s;
		animation: flashing $duration ease-in-out infinite;

		top: 2px !important;
		box-shadow: 0px 4px 0px 0px $green-disabled !important;

		@keyframes flashing {
			0% {
				background: $green;
			}
			50% {
				background: $green-loading;
			}
			100% {
				background: $green;
			}
		}
	}

	button:active {
		outline: none;
		top: 8px !important;
		box-shadow: 0px 0px 0px 0px $green-disabled !important;
	}

	button:hover {
		top: 4px;
		box-shadow: 0px 4px 0px 0px $green-disabled;
	}
</style>
