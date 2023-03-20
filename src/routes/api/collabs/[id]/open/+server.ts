import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../../database/prisma';
import cookie from 'cookie';
import { Jwt } from '../../../../../jwt';
import { CollabStatus, type Collab } from '@prisma/client';
import type { IDiscordUser } from '../../../../../utils/discord/interfaces/user';
import { DiscordUser } from '../../../../../utils/discord/user';

function dateIsInPast(date: Date): boolean {
	const now = new Date();

	return now.getTime() > date.getTime();
}

// TODO: move this into the database rather than the codebase
function hasEarlyAccess(user: IDiscordUser): boolean {
	const roles: { [key: string]: Date } = {
		'861679323739717642': new Date(2022, 6, 15),
		'994409775691472937': new Date(2022, 6, 15),
		'787723186556108840': new Date(2022, 6, 17),
		'723175697987666010': new Date(2022, 6, 17),
		'787388721255153694': new Date(2022, 6, 19),
		'787388728795987969': new Date(2022, 6, 21),
		'630636502187114496': new Date(2022, 6, 21),
		'767452000777535488': new Date(2022, 6, 23),
		'916677406104883200': new Date(2022, 6, 23),
		'630636846937800754': new Date(2022, 6, 23),
		'855525093044387900': new Date(2022, 6, 23),
		'963221388892700723': new Date(2022, 6, 25),
		'713451803357741168': new Date(2022, 6, 25)
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

export const GET: RequestHandler = async ({ params, request }) => {
	let user;

	try {
		const cookieHeader = request.headers.get('cookie');
		const cookies = cookie.parse(cookieHeader ?? '');
		const decoded = Jwt.decode(cookies['discord_token']);
		const token = decoded['access_token'] as string;

		const decodedUser = Jwt.decode(cookies['user_id']);
		const userId = decodedUser['user_id'] as string;

		user = await DiscordUser.getUser(userId, token);
	} catch (error) {
		// Don't need the user
	}

	const collab = await Prisma.client.collab.findUnique({
		where: {
			id: params.id
		}
	});

	if (!collab) {
		return json({
			message: 'Collab not found'
		}, {
			status: 404
		});
	}

	if (isCollabOpen(collab, user)) {
		return new Response(undefined);
	}

	return new Response(undefined, { status: 412 });
};
