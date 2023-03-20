import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { SentryClient } from '../../../../../bot/sentry';
import { DiscordUser } from '../../../../../utils/discord/user';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const userId = params['id'];

		const user = await DiscordUser.getUser(userId);

		return new Response(JSON.stringify(user));
	} catch (error) {
		SentryClient.log(error);

		return json({
			error: 'Failed to get user'
		}, {
			status: 400
		});
	}
};
