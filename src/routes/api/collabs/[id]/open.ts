import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../database/prisma';
import cookie from 'cookie';
import { Jwt } from '../../../../jwt';
import { getUser } from '../../discord/user';
import { CollabStatus, type Collab } from '@prisma/client';
import type { IDiscordUser } from '../../../../database/discord_user';

function dateIsInPast(date: Date): boolean {
	const now = new Date();

	return now.getTime() < date.getTime();
}

// TODO: move this into the database rather than the codebase
function hasEarlyAccess(user: IDiscordUser): boolean {
	const roles: { [key: string]: Date } = {
		'995772224529235978': new Date(2022, 7, 15),
		'994409775691472937': new Date(2022, 7, 15),
		'787723186556108840': new Date(2022, 7, 17),
		'723175697987666010': new Date(2022, 7, 17),
		'787388721255153694': new Date(2022, 7, 19),
		'787388728795987969': new Date(2022, 7, 21),
		'630636502187114496': new Date(2022, 7, 21),
		'767452000777535488': new Date(2022, 7, 23),
		'916677406104883200': new Date(2022, 7, 23),
		'630636846937800754': new Date(2022, 7, 23),
		'855525093044387900': new Date(2022, 7, 23),
		'963221388892700723': new Date(2022, 7, 25),
		'713451803357741168': new Date(2022, 7, 25)
	};

	for (const role of user.roles) {
		if (roles[role.id] && dateIsInPast(roles[role.id])) {
			return true;
		}
	}

	return false;
}

export function isCollabOpen(collab: Collab, user: IDiscordUser | null | undefined): boolean {
	if (user && user.admin) {
		return true;
	}

	if (collab.status === CollabStatus.OPEN) {
		return true;
	}

	if (user && collab.status === CollabStatus.EARLY_ACCESS && hasEarlyAccess(user)) {
		return true;
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

	if (isCollabOpen(collab, user)) {
		return {
			status: 200
		};
	}

	return {
		status: 412
	};
};
