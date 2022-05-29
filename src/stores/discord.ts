import { writable } from 'svelte/store';

export interface IDiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string;
}

export function getDiscordProfilePicture(user: IDiscordUser) {
	return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
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
