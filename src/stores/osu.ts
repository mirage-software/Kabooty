import type { Osu, OsuMode } from '@prisma/client';
import axios from 'axios';
import { writable } from 'svelte/store';

export type IOsuUser = Osu & { modes: OsuMode[] };

function createOsuUserStore() {
	const userStore = writable<IOsuUser | undefined>(undefined);

	return {
		subscribe: userStore.subscribe,
		update: (user: IOsuUser) => {
			userStore.set(user);
		},
		fetch: async () => {
			const data = (await axios.get('/api/osu/user')).data as IOsuUser;
			osu.update(data);
		}
	};
}

export const osu = createOsuUserStore();
