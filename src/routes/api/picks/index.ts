import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../jwt';
import { getUser } from '../discord/user';
import { Prisma } from '../../../database/prisma';
import { SentryClient } from '../../../bot/sentry';

export const get: RequestHandler = async ({ request }) => {
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

		const user = await getUser(token, userId);

		if (!user) {
			return {
				status: 403
			};
		}

		const picks = await Prisma.client.pick.findMany({
			where: {
				userId: user.id
			},
			include: {
				User: true,
				character: true,
				collab: true
			}
		});

		return {
			status: 200,
			body: picks
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};
