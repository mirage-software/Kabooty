<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';
	import { discord, getDiscordProfilePicture } from '../../../stores/discord';

	import axios, { type AxiosResponse } from 'axios';
	import type { IDiscordAuthUrl } from '../../../routes/api/discord/authorize';

	let request: Promise<AxiosResponse<IDiscordAuthUrl>>;
	let url: string | undefined;

	onMount(async () => {
		request = axios.get<IDiscordAuthUrl>('/api/discord/authorize');
		url = (await request).data.url;
	});

	async function click() {
		if (!url && !request) {
			return;
		}

		if (!url) {
			url = (await request).data.url;
		}

		if ($discord) {
			goto('/profile');
		} else {
			goto(url!);
		}
	}
</script>

<button on:click={click}>
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
</button>

<style lang="scss">
	button {
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
