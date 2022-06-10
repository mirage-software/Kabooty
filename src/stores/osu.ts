import axios from 'axios';
import { writable } from 'svelte/store';

export interface IOsuUser {
	id: string;
	username: string;
	country: string;
	rank: number;
	countryRank: number;
	gamemode: "osu" | "mania" | "taiko" | "fruits"
}

function createOsuUserStore() {
	const userStore = writable<IOsuUser | undefined>(undefined);

	return {
		subscribe: userStore.subscribe,
		update: (user: IOsuUser) => {
			userStore.set(user);
		},
		fetch: async () => {
			const data = (await axios.get("/api/osu/user")).data as IOsuUser;
			osu.update(data);
			return data;
		}
	};
}

export const osu = createOsuUserStore();