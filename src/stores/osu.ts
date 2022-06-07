import { writable } from 'svelte/store';

export interface IOsuUser {
	id: string;
	username: string;
}

export function getOsuProfilePicture(user: IOsuUser) {
	return `https://a.ppy.sh/${user.id}?${Date.now()}`;
}

function createOsuUserStore() {
	const userStore = writable<IOsuUser | undefined>(undefined);

	return {
		subscribe: userStore.subscribe,
		update: (user: IOsuUser) => {
			userStore.set(user);
		}
	};
}

export const osu = createOsuUserStore();
