import type { Osu, OsuMode } from '@prisma/client';
import axios from 'axios';
import { writable } from 'svelte/store';

export type IOsuUser = Osu & { modes: OsuMode[] };

function createOsuUserStore() {
	const userStore = writable<IOsuUser | undefined | null>(undefined);

	return {
		subscribe: userStore.subscribe,
		update: (user: IOsuUser | null) => {
			userStore.set(user);
		},
		fetch: async () => {
			try {
				const data = (await axios.get('/api/auth/osu/user')).data as IOsuUser;
				osu.update(data);
			} catch (error) {
				osu.update(null);
			}
		},
		setRedirectUrl: (url: string) => {
			localStorage.setItem('osu_page_redirect', url);
		}
	};
}

export const osu = createOsuUserStore();
