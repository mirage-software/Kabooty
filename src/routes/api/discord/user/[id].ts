import type { RequestHandler } from '@sveltejs/kit';
import { SentryClient } from '../../../../bot/sentry';
import { DiscordUser } from '../../../../utils/discord/user';

export const get: RequestHandler = async ({ params }) => {
	try {
		const userId = params['id'];

		const user = await DiscordUser.getUser(userId);

		return {
			status: 200,
			body: JSON.stringify(user)
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400,
			body: {
				error: 'Failed to get user'
			}
		};
	}
};
