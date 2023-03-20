import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../jwt';
import { Prisma } from '../../../database/prisma';
import { CollabType, type Collab } from '@prisma/client';
import { SentryClient } from '../../../bot/sentry';
import { DiscordUser } from '../../../utils/discord/user';
import { Formatting } from '../../../utils/text/formatting';

export const GET: RequestHandler = async () => {
	// !! TODO: this call needs to be paginated in the future
	const collabs = await Prisma.client.collab.findMany({
		include: {
			collabAssets: true
		}
	});

	return {
		status: 200,
		body: collabs
	};
};

export const POST: RequestHandler = async ({ request }) => {
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

		if (!user || !user.admin) {
			return {
				status: 403
			};
		}

		const body: Collab = await request.json();
		let url = null;

		if (body.url !== undefined) {
			url = Formatting.toKebabCase(body.url);
		}

		const collab = await Prisma.client.collab.create({
			data: {
				// TODO: these are hardcoded for now, must be an option later
				type: CollabType.OPEN,
				url: url,
				status: body.status,
				creatorId: userId,
				title: body.title,
				topic: body.topic,
				rules: body.rules === '' ? null : body.rules
			}
		});

		return {
			status: 200,
			body: collab
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};
