<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';
	import { discord, getDiscordProfilePicture } from '../../stores/discord';

	import axios, { type AxiosResponse } from 'axios';
	import type { IDiscordAuthUrl } from '../api/discord/authorize/+server';

	let request: Promise<AxiosResponse<IDiscordAuthUrl>>;
	let url: string | undefined;

	// TODO: use svelte fetch and turn into input
	onMount(async () => {
		request = axios.get<IDiscordAuthUrl>('/api/discord/authorize');
		url = (await request).data.url;
	});
</script>

<a href={$discord ? '/profile' : url}>
	<p>
		{$discord ? $discord.username + '#' + $discord.discriminator : $t('header.signin')}
	</p>
	<div id="user">
		{#if !$discord}
			<i id="icon" class="las la-user" />
		{:else}
			<!-- svelte-ignore a11y-missing-attribute -->
			<img id="avatar" src={getDiscordProfilePicture($discord)} />
		{/if}
	</div>
</a>

<style lang="scss">
	a {
		height: $header-height;

		background: none;
		color: white;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: none;

		border-radius: $border-radius-s;

		display: flex;
		flex-direction: row;
		align-items: center;

		#user {
			height: $header-height - $margin-s * 2;
			width: $header-height - $margin-s * 2;

			margin: $margin-s;

			border: 1px solid white;
			border-radius: 50%;

			display: flex;

			justify-content: center;
			align-items: center;

			#icon {
				font-size: $icon-size;
				margin-bottom: 3px;
			}

			#avatar {
				height: 100%;
				width: 100%;
				border-radius: 50%;
			}
		}

		p {
			font-weight: 400;
			font-size: $font-size-footer;

			display: none;

			@media (min-width: $breakpoint-m) {
				display: block;
			}
		}
	}
</style>
