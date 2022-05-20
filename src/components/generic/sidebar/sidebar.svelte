<script lang="ts">
	import SidebarButton from '../design/sidebar_button.svelte';
	import type { IFuctions } from './functions';

	let active = false;

	import links from '../header/links.json';

	export const functions: IFuctions = {
		toggle() {
			active = !active;
		}
	};
</script>

<div id="sidebar" class={active ? 'active' : 'inactive'}>
	<i id="icon" class="las la-angle-left" on:click={() => functions.toggle()} />

	{#each links as link}
		<div>
			<SidebarButton route={link['route']} string={link['string']} icon={link['icon']} />
		</div>
	{/each}
</div>
<div id="scrim" class={active ? 'active' : 'inactive'} />

<style lang="scss">
	#sidebar.active {
		max-width: 300px !important;
		box-shadow: 0px 0px 50px 15px rgba(0, 0, 0, 0.2) !important;
	}

	#scrim.active {
		opacity: 1;
	}

	#sidebar {
		position: absolute;
		width: 100%;
		max-width: 0px;
		left: 0;
		height: 100%;

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
		position: absolute;
		width: 100%;
		height: 100%;

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
