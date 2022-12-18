import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../../jwt';
import { Prisma } from '../../../../database/prisma';
import type { Collab } from '@prisma/client';
import { SentryClient } from '../../../../bot/sentry';
import { DiscordUser } from '../../../../utils/discord/user';
import { toKebabCase } from '../../../../utils/text/toKebabCase';

export const get: RequestHandler = async ({ params }) => {
	const where = {
		OR: [
			{
				url: params.id
			},
			{
				id: params.id
			}
		]
	};

	const collab = await Prisma.client.collab.findFirst({
		where,
		include: {
			collabAssets: true
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

	return {
		status: 200,
		body: collab
	};
};

export const put: RequestHandler = async ({ request, params }) => {
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

	if (!user || !user.admin) {
		return {
			status: 403
		};
	}

	const body: Collab = await request.json();
	let url = null;

	if (body.url !== undefined) {
		url = toKebabCase(body.url);
	}

	try {
		const updated = await Prisma.client.collab.update({
			where: {
				id: params.id
			},
			data: {
				status: body.status,
				url: url,
				topic: body.topic,
				title: body.title,
				rules: body.rules === '' ? null : body.rules,
				bumpStatus: body.bumpStatus,
				allowEditing: body.allowEditing
			},
			include: {
				collabAssets: true
			}
		});

		return {
			status: 200,
			body: updated
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};

export const del: RequestHandler = async ({ request, params }) => {
	// TODO: delete images

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

	if (!user || !user.admin) {
		return {
			status: 403
		};
	}

	try {
		await Prisma.client.collab.delete({
			where: {
				id: params.id
			}
		});

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 500
		};
	}
};
