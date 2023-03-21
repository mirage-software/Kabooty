<script lang="ts">
	import Navigation from './buttons/navigation.svelte';
	import Account from './buttons/account.svelte';
	import Sidebar from './sidebar.svelte';

	import links from './links.json';
	export let url: string | undefined;

	let toggleSidebar: () => void;
</script>

<div id="header">
	<Sidebar bind:toggle={toggleSidebar} />
	<div id="navigation">
		<div id="decoration">
			<!-- svelte-ignore a11y-missing-attribute -->
			<img id="dec1" src="/assets/27.png" />
			<!-- svelte-ignore a11y-missing-attribute -->
			<img id="dec2" src="/assets/29.png" />
		</div>
		<i id="icon" class="las la-bars" on:click={toggleSidebar} on:keypress={toggleSidebar} />

		<a href="/"><img src="/logo.png" alt="Home" /></a>

		<div style="display: flex;">
			<div id="links">
				{#each links as link}
					<Navigation {link} type="header" />
				{/each}
			</div>

			<Account {url} />
		</div>
	</div>
</div>

<style lang="scss">
	#header {
		background: $decoration-fill;
		background: linear-gradient(90deg, $gradient-dark 0%, $gradient-light 100%);
		box-shadow: $box-shadow;

		width: 100%;
		height: $header-height;
		display: flex;
		justify-content: center;

		#navigation {
			max-width: $max-width;
			width: 100%;
			height: $header-height;
			display: flex;
			align-items: center;
			justify-content: space-between;

			position: relative;

			#decoration {
				position: absolute;
				height: $header-height;
				width: 100%;
				overflow: hidden;
				max-width: $max-width;

				top: 0;

				display: flex;
				justify-content: space-between;

				pointer-events: none;

				opacity: 0.8;

				img {
					margin: 0;
				}

				img#dec1 {
					position: relative;
					top: -30px;
					left: -10px;
					width: 120px;
					height: 120px;
				}

				img#dec2 {
					position: relative;
					top: -30px;
					right: -15px;
					width: 120px;
					height: 120px;
				}
			}

			#icon {
				width: $header-height;
				height: $header-height;
				line-height: $header-height;

				text-align: center;

				font-size: $icon-size;

				color: white;

				display: block;

				@media (min-width: $breakpoint-m) {
					display: none;
				}
			}

			img {
				height: 33px;
				margin-left: 0;

				@media (min-width: $breakpoint-m) {
					margin-left: $margin-m - $margin-xs;
				}
			}

			#links {
				min-width: $header-height;

				margin-right: 0;

				display: none;

				@media (min-width: $breakpoint-m) {
					margin-right: $margin-m;
					display: flex;
				}

				div {
					display: none;

					@media (min-width: $breakpoint-m) {
						display: block;
					}
				}
			}
		}
	}
</style>
