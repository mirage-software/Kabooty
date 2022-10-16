import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../jwt';
import { SentryClient } from '../../../bot/sentry';
import { DiscordUser } from '../../../utils/discord/user';
import { Bumps } from '../../../cron/bumps';

export const patch: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	try {
		if (!token) {
			return {
				status: 401
			};
		}

		const user = await DiscordUser.getUser(userId, token);

		if (!user) {
			return {
				status: 403
			};
		}

		await Bumps.bump(user.id);

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};
