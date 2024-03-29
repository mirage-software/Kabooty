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

	const pick = await Prisma.client.pick.findUnique({
		where: {
			id: params.id
		}
	});

	if (!pick) {
		return {
			status: 404,
			body: {
				message: 'No materials found for this pick'
			}
		};
	}

	if (user.id !== pick.userId) {
		return {
			status: 403
		};
	}

	const deliveryPath = path.join(ServerPaths.collab(pick.collabId), '/delivery/', `${pick.id}.zip`);

	const file = readFileSync(deliveryPath);

	const contentType = mime.contentType('delivery.zip') || 'application/octet-stream';

	return {
		status: 200,
		headers: {
			'Content-Type': contentType,
			'Content-Disposition': `attachment; filename="collab-${pick.collabId}-${user.id}.zip"`,
			'cache-control': 'public, max-age=172800'
		},
		body: file
	};
};
