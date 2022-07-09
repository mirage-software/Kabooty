import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../database/prisma';
import cookie from 'cookie';
import { Jwt } from '../../../jwt';

export const get: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decodedToken = Jwt.decode(cookies['discord_token']);
	const token = decodedToken['access_token'] as string;

	if (!token) {
		return {
			status: 401
		};
	}

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	try {
		const user = await Prisma.client.osu.findUnique({
			where: {
				discordId: userId
			},
			include: {
				modes: {
					where: {
						selected: true
					}
				}
			}
		});

		if (user) {
			user.access_token = null;
			user.refresh_token = null;
		}

		return {
			status: 200,
			body: user
		};
	} catch (error) {
		return {
			status: 400,
			body: {
				error: 'Failed to get osu details'
			}
		};
	}
};
