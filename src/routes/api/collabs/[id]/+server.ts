import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../../jwt';
import { Prisma } from '../../../../database/prisma';
import type { Collab } from '@prisma/client';
import { SentryClient } from '../../../../bot/sentry';
import { DiscordUser } from '../../../../utils/discord/user';
import { Formatting } from '../../../../utils/text/formatting';

export const GET: RequestHandler = async ({ params }) => {
	const collab = await Prisma.client.collab.findFirst({
		where: {
			OR: [
				{
					id: params.id
				},
				{
					url: params.id
				}
			]
		},
		include: {
			collabAssets: true
		}
	});

	if (!collab) {
		return json(
			{
				message: 'Collab not found'
			},
			{
				status: 404
			}
		);
	}

	return json(collab);
};

export const PUT: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	if (!token) {
		return new Response(undefined, { status: 401 });
	}

	const user = await DiscordUser.getUser(userId, token);

	if (!user || !user.admin) {
		return new Response(undefined, { status: 403 });
	}

	const body: Collab = await request.json();

	try {
		const updated = await Prisma.client.collab.update({
			where: {
				id: params.id
			},
			data: {
				status: body.status,
				url: Formatting.toKebabCase(body.url),
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

		return json(updated);
	} catch (error) {
		SentryClient.log(error);

		return new Response(undefined, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ request, params }) => {
	// TODO: delete images

	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	if (!token) {
		return new Response(undefined, { status: 401 });
	}

	const user = await DiscordUser.getUser(userId, token);

	if (!user || !user.admin) {
		return new Response(undefined, { status: 403 });
	}

	try {
		await Prisma.client.collab.delete({
			where: {
				id: params.id
			}
		});

		return new Response(undefined);
	} catch (error) {
		SentryClient.log(error);

		return new Response(undefined, { status: 500 });
	}
};
