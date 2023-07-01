import { writable } from 'svelte/store';
import type { IDiscordUser } from '../utils/discord/interfaces/user';
import type { User } from '@prisma/client';

export function getDiscordProfilePicture(user: IDiscordUser) {
	if (user.avatar) {
		return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
	} else {
		const hasDiscriminator = user.discriminator !== '0' && user.discriminator;

		// This logic is taken from discord.js
		const image = hasDiscriminator
			? Number(BigInt(user.id) >> 22n) % 6
			: Number(user.discriminator) % 5;

		return `https://cdn.discordapp.com/embed/avatars/${image}.png`;
	}
}

export function getFormattedDate(date: string, withTime = false) {
	const options: Intl.DateTimeFormatOptions = {
		timeZone: 'UTC'
	};

	if (withTime) {
		options.timeZone = 'UTC';
		options.hour12 = false;
		options.hour = 'numeric';
		options.minute = 'numeric';
		options.second = 'numeric';
		options.timeZoneName = 'short';
	}

	return new Date(date).toLocaleDateString(navigator.language, options);
}

export function getUserName(user: IDiscordUser | User) {
	const isNewUser = user.discriminator === '0' || !user.discriminator;
	return isNewUser ? `@${user.username}` : `${user.username}#${user.discriminator}`;
}

function createDiscordUserStore() {
	const userStore = writable<IDiscordUser | undefined>(undefined);

	return {
		subscribe: userStore.subscribe,
		update: (user: IDiscordUser) => {
			userStore.set(user);
		},
		setRedirectUrl: (url: string) => {
			localStorage.setItem('discord_page_redirect', url);
		}
	};
}

export const discord = createDiscordUserStore();
