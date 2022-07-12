<div id="background">
	<div id="container">
		<slot />
	</div>
</div>

<style lang="scss">
	div#background {
		background-color: $dark-overlay;
		border-radius: $border-radius-s;

		padding: $margin-s;

		display: flex;

		align-items: center;
		justify-content: center;
		align-content: center;

		#container {
			display: flex;

			align-items: center;
			justify-content: center;
			align-content: center;

			overflow: hidden;

			border-radius: calc($border-radius-s / 2);
		}
	}
</style>
