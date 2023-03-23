import { json as json$1 } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { SentryClient } from '../../../bot/sentry';
import { Prisma } from '../../../database/prisma';
import type { Prisma as prisma } from '@prisma/client';
import { Jwt } from '../../../jwt';

import cookie from 'cookie';
import { CollabStatus } from '@prisma/client';
import { deletePick } from '../picks/[id]/+server';
import { DiscordUser } from '../../../utils/discord/user';

export const GET: RequestHandler = async ({ request }) => {
	const url = new URL(request.url);
	const query = url.searchParams.get('search')?.trim() ?? undefined;
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const sort = url.searchParams.get('sort') ?? undefined;
	const order = url.searchParams.get('order') ?? 'desc';

	const search = query?.split(' ');

	let OR: prisma.Enumerable<prisma.AnimeCharacterWhereInput> | undefined;

	if (search) {
		OR = [
			{ AND: search.map((s) => ({ name: { contains: s, mode: 'insensitive' } })) },
			{ AND: search.map((s) => ({ anime_name: { contains: s, mode: 'insensitive' } })) }
		];
	}

	let orderBy: Array<object> = [{ id: order }];

	switch (sort) {
		case 'char': {
			orderBy = [
				{
					name: order
				}
			];
			break;
		}
		case 'anime': {
			orderBy = [
				{
					anime_name: order === 'desc' ? 'asc' : 'desc'
				},
				{
					name: order
				}
			];
			break;
		}
	}

	const characters = await Prisma.client.animeCharacter.findMany({
		where: {
			OR: OR
		},
		include: {
			picks: true
		},
		orderBy: orderBy,
		take: 50,
		skip: 50 * (page - 1)
	});

	const count = await Prisma.client.animeCharacter.count({
		where: {
			OR: OR
		}
	});

	return json$1({
		characters,
		count
	});
};

export const POST: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decodedToken = Jwt.decode(cookies['discord_token']);
	const token = decodedToken['access_token'] as string;

	if (!token) {
		return new Response(undefined, { status: 401 });
	}

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	try {
		const user = await DiscordUser.getUser(userId, token);

		if (!user || !user.admin) {
			return new Response(undefined, { status: 403 });
		}

		const body = await request.json();

		if (!Array.isArray(body)) {
			return new Response(undefined, { status: 400 });
		}

		const characters = [];

		for (let i = 0; i < body.length; i++) {
			const character = body[i];

			if (!character.name || !character.anime_name) {
				return new Response(undefined, { status: 400 });
			}

			characters.push({
				name: character.name,
				anime_name: character.anime_name
			});
		}

		await Prisma.client.animeCharacter.createMany({
			data: characters
		});

		return new Response(undefined);
	} catch (error) {
		SentryClient.log(error);

		return new Response(undefined, { status: 400 });
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decodedToken = Jwt.decode(cookies['discord_token']);
	const token = decodedToken['access_token'] as string;

	if (!token) {
		return new Response(undefined, { status: 401 });
	}

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	try {
		const user = await DiscordUser.getUser(userId, token);

		if (!user || !user.admin) {
			return new Response(undefined, { status: 403 });
		}

		const url = new URL(request.url);
		const id = url.searchParams.get('id') ?? undefined;

		if (!id) {
			return new Response(undefined, { status: 400 });
		}

		const character = await Prisma.client.animeCharacter.findUnique({
			where: {
				id: parseInt(id)
			},
			include: {
				picks: {
					where: {
						collab: {
							OR: [{ status: CollabStatus.OPEN }, { status: CollabStatus.EARLY_ACCESS }]
						}
					},
					include: {
						assets: true
					}
				}
			}
		});

		if (!character) {
			return new Response(undefined, { status: 404 });
		}

		if (character.picks.length > 0) {
			for (let i = 0; i < character.picks.length; i++) {
				await deletePick(character.picks[i]);
			}
		}

		await Prisma.client.animeCharacter.delete({
			where: {
				id: parseInt(id)
			}
		});

		return new Response(undefined);
	} catch (error) {
		SentryClient.log(error);

		return new Response(undefined, { status: 400 });
	}
};
