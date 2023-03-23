import type { Handle } from '@sveltejs/kit';
import { DiscordBot } from './bot/discord';
import { Jwt } from './jwt';
import { Prisma } from '../../../../Documents/Mirage/kabooty/src/database/prisma';

// Invoked for each endpoint called and initially for SSR router
export const handle: Handle = async ({ event, resolve }) => {
	// TODO: migrate to token table in the database, with expiry, and refreshing, once the discord token has expired
	const tokenJwt = event.cookies.get('discord_token');
	const userIdJwt = event.cookies.get('user_id');

	// !! initialize discord bot every time a user checks if they're authenticated
	// !! this is a temporary solution until the discord bot is a separate codebase
	DiscordBot.client;

	let token: string | undefined;
	let userId: string | undefined;

	try {
		token = Jwt.decode(tokenJwt ?? '')['access_token'] as string;
	} catch (_) {
		// !! do nothing
	}

	try {
		userId = Jwt.decode(userIdJwt ?? '')['user_id'] as string;
	} catch (_) {
		// !! do nothing
	}

	event.locals.signedIn = token !== undefined;

	if (userId) {
		event.locals.user = await Prisma.client.user.findUnique({
			where: {
				discordId: userId
			}
		});
	}

	return resolve(event);
};
