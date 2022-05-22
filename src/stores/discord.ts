import { get, writable } from 'svelte/store';

interface IDiscordUser {
	username: string;
	discriminator: string;
	avatar: string;
}

function createDiscordTokenStore() {
	const tokenStore = writable<string>(undefined);
	const userStore = writable<IDiscordUser | undefined>(undefined);

	return {
		subscribe: tokenStore.subscribe,
		update: (token: string) => {
			tokenStore.set(token);
			discord.getUsername();
			// discord.getProfilePicture();
		},
		getProfilePicture: async () => {
			const token = get(tokenStore);

			if (!token) {
				return undefined;
			}

			// let user = get(userStore);

			// if (!user) {
			// 	try {
			// 		// user = await client.getUser(token);
			// 	} catch (error) {
			// 		console.error(error);
			// 	}
			// 	userStore.set(user);
			// }

			// console.log(user?.avatar);
		},
		getUsername: async () => {
			const token = get(tokenStore);

			console.log(token);

			if (!token) {
				username.update(undefined);
				return;
			}

			// let user = get(userStore);

			// const user = await fetch(`https://discord.com/api/users/@me`, {
			// 	headers: {
			// 		Authorization: `Bearer ${token}`
			// 	}
			// });

			console.log(user);

			// if (!user) {
			// try {
			// 	client
			// 		.getUser(token)
			// 		.then((user) => {
			// 			userStore.set(user);
			// 			console.log(user);
			// 			username.update(user.username + '#' + user.discriminator);
			// 		})
			// 		.catch((error) => {
			// 			console.error(error);
			// 		});
			// } catch (error) {
			// 	console.error(error);
			// }
			// userStore.set(user);
			// }

			// console.log(user);

			// username.update(user.username + '#' + user.discriminator);
		}
	};
}

function createDiscordUsernameStore() {
	const { subscribe, set } = writable<string | undefined>(undefined);

	return {
		subscribe,
		update: set
	};
}

export const discord = createDiscordTokenStore();
export const username = createDiscordUsernameStore();
