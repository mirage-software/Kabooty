import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../jwt';
import { Prisma } from '../../../database/prisma';
import { CollabStatus, type Prisma as prisma } from '@prisma/client';
import { CollabType, type Collab } from '@prisma/client';
import { SentryClient } from '../../../bot/sentry';
import { DiscordUser } from '../../../utils/discord/user';
import { Formatting } from '../../../utils/text/formatting';

export const GET: RequestHandler = async ({ url, locals }) => {
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const query = url.searchParams.get('query')?.trim() ?? undefined;
	const sort = url.searchParams.get('sort') ?? undefined;
	const status: CollabStatus | undefined =
		(url.searchParams.get('status') as CollabStatus | undefined) ?? undefined;
	const order = url.searchParams.get('order') ?? 'asc';

	if (order !== 'asc' && order !== 'desc') {
		return json({}, { status: 400 });
	}

	if (status && !Object.keys(CollabStatus).includes(status)) {
		return json({}, { status: 400 });
	}

	const search = query?.split(' ');

	let orderBy: Array<prisma.CollabOrderByWithRelationAndSearchRelevanceInput> = [
		{
			status: order
		},
		{
			participants: {
				_count: order
			}
		}
		// {
		// 	character: {
		// 		anime_name: order === 'desc' ? 'asc' : 'desc'
		// 	}
		// },
		// {
		// 	name: order
		// },
		// {
		// 	createdAt: order
		// }
	];

	switch (sort) {
		case 'size': {
			orderBy = [
				{
					participants: {
						_count: order
					}
				}
			];
			break;
		}
		case 'status': {
			orderBy = [
				{
					status: order
				}
			];
			break;
		}
	}

	let OR: prisma.Enumerable<prisma.CollabWhereInput> | undefined;

	if (search) {
		OR = [
			{ AND: search.map((s) => ({ title: { contains: s, mode: 'insensitive' } })) },
			{
				AND: search.map((s) => ({
					guild: { discordGuildId: { contains: s, mode: 'insensitive' } }
				}))
			},
			{ AND: search.map((s) => ({ guild: { name: { contains: s, mode: 'insensitive' } } })) }
			// {
			// 	AND: search.map((s) => ({
			// 		character: { anime_name: { contains: s, mode: 'insensitive' } }
			// 	}))
			// },
			// {
			// 	AND: search.map((s) => ({
			// 		user: { username: { contains: s, mode: 'insensitive' } }
			// 	}))
			// },
			// {
			// 	AND: search.map((s) => ({
			// 		user: { discordId: { contains: s, mode: 'insensitive' } }
			// 	}))
			// }
		];
	}

	const collabs = await Prisma.client.collab.findMany({
		where: {
			AND: {
				OR: OR,
				status: status
			}
		},
		include: {
			collabAssets: true,
			earlyAccessRoles: {
				include: {
					guildRole: true
				}
			},
			guild: {
				include: {
					userRoles: {
						where: {
							userId: locals.user?.id ?? undefined
						}
					}
				}
			},
			_count: {
				select: {
					participants: true
				}
			}
		},

		orderBy: orderBy,
		take: 50,
		skip: 50 * (page - 1)
	});

	return json(collabs);
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
			return new Response(undefined, { status: 401 });
		}

		const user = await DiscordUser.getUser(userId, token);

		if (!user || !user.admin) {
			return new Response(undefined, { status: 403 });
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

		return json(collab);
	} catch (error) {
		SentryClient.log(error);

		return new Response(undefined, { status: 400 });
	}
};
