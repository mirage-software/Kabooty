import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../database/prisma';
import cookie from 'cookie';
import { Jwt } from '../../../../jwt';
import { getUser } from '../../discord/user';
import { CollabStatus } from '@prisma/client';
import type { IDiscordUser } from '../../../../database/discord_user';

// TODO: move this into the database rather than the codebase
function hasEarlyAccess(user: IDiscordUser): boolean {
	const roles: { [key: string]: Date } = {
		'1244o5768365837824': new Date(2022, 7, 15),
		'1244357683658e7824': new Date(2022, 7, 15)
	};

	for (const role of user.roles) {
		if (roles[role.id] && roles[role.id] < new Date()) {
			return true;
		}
	}

	return false;
}

export const get: RequestHandler = async ({ params, request }) => {
	let user;

	try {
		const cookieHeader = request.headers.get('cookie');
		const cookies = cookie.parse(cookieHeader ?? '');
		const decoded = Jwt.decode(cookies['discord_token']);
		const token = decoded['access_token'] as string;

		const decodedUser = Jwt.decode(cookies['user_id']);
		const userId = decodedUser['user_id'] as string;

		user = await getUser(token, userId);
	} catch (error) {
		// Don't need the user
	}

	const collab = await Prisma.client.collab.findUnique({
		where: {
			id: params.id
		}
	});

	if (!collab) {
		return {
			status: 404,
			body: {
				message: 'Collab not found'
			}
		};
	}

	if (user && user.admin) {
		return {
			status: 200
		};
	}

	if (collab.status === CollabStatus.OPEN) {
		return {
			status: 200
		};
	}

	if (user && collab.status === CollabStatus.EARLY_ACCESS && hasEarlyAccess(user)) {
		return {
			status: 200
		};
	}

	return {
		status: 412
	};
};
