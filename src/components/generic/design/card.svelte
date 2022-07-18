<div id="card">
	<slot />
</div>

<style lang="scss">
	#card {
		display: flex;
		flex-direction: column;

		background-color: $card-color;
		width: 100%;
		height: 100%;
		border-radius: $border-radius-s;
		box-shadow: $box-shadow-big;
	}
</style>
