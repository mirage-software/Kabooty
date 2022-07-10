import { writable } from 'svelte/store';
import type { IDiscordUser } from '../database/discord_user';

export function getDiscordProfilePicture(user: IDiscordUser) {
	if (user.avatar) {
		return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
	} else {
		const lastDigit = user.discriminator.slice(-1);
		const image = parseInt(lastDigit, 10) % 5;

		return `https://cdn.discordapp.com/embed/avatars/${image}.png`;
	}
}

export function getFormattedDate(date: string) {
	const options = {
		timeZone: 'UTC'
	};

	return new Date(date).toLocaleDateString(navigator.language, options);
}

function createDiscordUserStore() {
	const userStore = writable<IDiscordUser | undefined>(undefined);

	return {
		subscribe: userStore.subscribe,
		update: (user: IDiscordUser) => {
			userStore.set(user);
		}
	};
}

export const discord = createDiscordUserStore();
