import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { SentryClient } from '../../../../bot/sentry';
import { Jwt } from '../../../../jwt';
import { DiscordUser } from '../../../../utils/discord/user';

export const get: RequestHandler = async ({ request }) => {
	try {
		const cookieHeader = request.headers.get('cookie');
		const cookies = cookie.parse(cookieHeader ?? '');
		const decoded = Jwt.decode(cookies['discord_token']);
		const token = decoded['access_token'] as string;

		const decodedUser = Jwt.decode(cookies['user_id']);
		const userId = decodedUser['user_id'] as string;

		if (!token) {
			return {
				status: 401
			};
		}

		const user = await DiscordUser.getUser(userId, token);

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
