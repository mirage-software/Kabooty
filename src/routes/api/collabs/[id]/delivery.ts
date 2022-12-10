import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../../jwt';
import { Prisma } from '../../../../database/prisma';
import { DiscordUser } from '../../../../utils/discord/user';
import { ServerPaths } from '../../../../utils/paths/server';
import { readFileSync } from 'fs';
import path from 'path';
import * as mime from 'mime-types';

export const get: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	const collab = await Prisma.client.collab.findUnique({
		where: {
			id: params.id
		}
	});

	const user: any = await DiscordUser.getUser(userId, token);

	if (!collab) {
		return {
			status: 404,
			body: {
				message: 'Collab not found'
			}
		};
	}

	if (!user) {
		return {
			status: 404,
			body: {
				message: 'No Materials found for this user. Are you signed in?'
			}
		};
	}

	const pick = await Prisma.client.pick.findFirst({
		where: {
			userId: user.id,
			collabId: collab.id
		}
	});

	if (!pick) {
		return {
			status: 404,
			body: {
				message: 'No Materials found for this user.'
			}
		};
	}

	const deliveryPath = path.join(ServerPaths.collab(collab.id), '/delivery/', `${pick.id}.zip`);

	const file = readFileSync(deliveryPath);

	const contentType = mime.contentType('delivery.zip') || 'application/octet-stream';

	return {
		status: 200,
		headers: {
			'Content-Type': contentType,
			'Content-Disposition': `attachment; filename="${user.username}.zip"`,
			'cache-control': 'public, max-age=172800'
		},
		body: file
	};
};
