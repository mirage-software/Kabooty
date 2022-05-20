<script lang="ts">
	import HeaderButton from '../design/header_button.svelte';
	import SignInButton from '../design/signin_button.svelte';
	import Sidebar from '../sidebar/sidebar.svelte';
	import type { IFuctions } from '../sidebar/functions';

	import links from './links.json';

	let sidebar: IFuctions;
</script>

<div id="header">
	<Sidebar bind:functions={sidebar} />
	<div id="navigation">
		<i id="icon" class="las la-bars" on:click={() => sidebar.toggle()} />

		<a href="/"><img src="/logo.png" alt="Home" /></a>

		<div style="display: flex;">
			<div id="links">
				{#each links as link}
					<div>
						<HeaderButton route={link['route']} string={link['string']} icon={link['icon']} />
					</div>
				{/each}
			</div>

			<SignInButton />
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
					margin-right: $margin-s + $margin-m;
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
