<script lang="ts">
	import Navigation from './buttons/navigation.svelte';

	let active = false;

	import links from './links.json';

	export function toggle() {
		active = !active;
	}
</script>

<div id="sidebar" class={active ? 'active' : 'inactive'}>
	<div id="decoration">
		<!-- svelte-ignore a11y-missing-attribute -->
		<img src="/assets/decoration.svg" />
		<div class="overlay" />
	</div>
	<i id="icon" class="las la-angle-left" on:click={toggle} on:keypress={toggle} />

	{#each links as link}
		<Navigation {link} type="sidebar" />
	{/each}
</div>
<div id="scrim" class={active ? 'active' : 'inactive'} />
<div on:click={toggle} on:keypress={toggle} id="toggle" class={active ? 'active' : 'inactive'} />

<style lang="scss">
	#sidebar.active {
		max-width: 300px !important;
		box-shadow: 0px 0px 50px 15px rgba(0, 0, 0, 0.2) !important;
	}

	#scrim.active {
		opacity: 1;
	}

	#toggle {
		position: fixed;

		top: 0;
		bottom: 0;
		left: 0;
		right: 0;

		opacity: 0;

		z-index: 5;

		display: block;

		@media (min-width: $breakpoint-m) {
			display: none;
		}
	}

	#toggle.inactive {
		display: none;
	}

	#sidebar {
		position: fixed;
		width: 100%;
		max-width: 0px;
		left: 0;
		bottom: 0;
		top: 0;

		transition: max-width 0.6s, box-shadow 1s;
		transition-timing-function: ease;

		overflow: hidden;

		background: $sidebar-background;

		box-shadow: none;

		z-index: 6;

		display: flex;
		flex-direction: column;

		@media (min-width: $breakpoint-m) {
			display: none;
		}

		#decoration {
			position: absolute;
			height: 100%;
			width: 100%;
			overflow: hidden;

			display: flex;
			flex-direction: column;

			pointer-events: none;

			.overlay {
				position: absolute;
				top: 0;
				left: 100px;
				height: 100%;
				width: 200px;
				z-index: -1;

				background: linear-gradient(
					270deg,
					rgba($content-background, 0) 0%,
					$content-background 80%
				);
			}

			img {
				position: relative;
				height: 100%;
				width: 300px;
				z-index: -3;
				opacity: 0.03;
				left: 100px;
				transform: rotateY(180deg);
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
		}
	}

	#scrim {
		position: fixed;

		top: 0;
		bottom: 0;
		left: 0;
		right: 0;

		opacity: 0;
		transition-property: opacity;
		transition-duration: 300ms;
		transition-delay: 0s;

		pointer-events: none;

		background-color: rgba(0, 0, 0, 0.3);

		z-index: 5;

		display: block;

		@media (min-width: $breakpoint-m) {
			display: none;
		}
	}
</style>
