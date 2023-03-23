<script lang="ts">
	import { base } from '$app/paths';
	import { t } from 'svelte-intl-precompile';
	import { discord, getDiscordProfilePicture } from '../../../../stores/discord';
</script>

<a
	href={base + ($discord ? '/profile' : '/login')}
	aria-label={$discord ? $t('header.profile') : $t('header.signin')}
>
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
		border-radius: $border-radius-s;

		display: flex;
		flex-direction: row;
		align-items: center;

		#user {
			height: $header-height - $margin-s * 2;
			width: $header-height - $margin-s * 2;

			margin: $margin-s calc($margin-s - 1px);

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
