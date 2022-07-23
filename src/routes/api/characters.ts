import type { RequestHandler } from '@sveltejs/kit';
import { SentryClient } from '../../bot/sentry';
import { Prisma } from '../../database/prisma';
import { Jwt } from '../../jwt';

import cookie from 'cookie';
import { getUser } from './discord/user';
import { CollabStatus } from '@prisma/client';
import { deletePick } from './collabs/[id]/picks/[pick_id]';

export const get: RequestHandler = async ({ request }) => {
	const url = new URL(request.url);
	const query = url.searchParams.get('search') ?? '';
	const page = parseInt(url.searchParams.get('page') ?? '1');

	const characters = await Prisma.client.animeCharacter.findMany({
		where: {
			OR: [
				{ name: { contains: query, mode: 'insensitive' } },
				{ anime_name: { contains: query, mode: 'insensitive' } }
			]
		},
		include: {
			Pick: true
		},
		take: 50,
		skip: 50 * (page - 1)
	});

	const count = await Prisma.client.animeCharacter.count({
		where: {
			OR: [
				{ name: { contains: query, mode: 'insensitive' } },
				{ anime_name: { contains: query, mode: 'insensitive' } }
			]
		}
	});

	return {
		status: 200,
		body: {
			characters,
			count
		}
	};
};

export const post: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decodedToken = Jwt.decode(cookies['discord_token']);
	const token = decodedToken['access_token'] as string;

	if (!token) {
		return {
			status: 401
		};
	}

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	try {
		const user = await getUser(token, userId);

		if (!user || !user.admin) {
			return {
				status: 403
			};
		}

		const body = await request.json();

		if (!Array.isArray(body)) {
			return {
				status: 400
			};
		}

		const characters = [];

		for (let i = 0; i < body.length; i++) {
			const character = body[i];

			if (!character.name || !character.anime_name) {
				return {
					status: 400
				};
			}

			characters.push({
				name: character.name,
				anime_name: character.anime_name
			});
		}

		await Prisma.client.animeCharacter.createMany({
			data: characters
		});

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};

export const del: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decodedToken = Jwt.decode(cookies['discord_token']);
	const token = decodedToken['access_token'] as string;

	if (!token) {
		return {
			status: 401
		};
	}

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	try {
		const user = await getUser(token, userId);

		if (!user || !user.admin) {
			return {
				status: 403
			};
		}

		const url = new URL(request.url);
		const id = url.searchParams.get('id') ?? undefined;

		if (!id) {
			return {
				status: 400
			};
		}

		const character = await Prisma.client.animeCharacter.findUnique({
			where: {
				id: parseInt(id)
			},
			include: {
				Pick: {
					where: {
						collab: {
							OR: [{ status: CollabStatus.OPEN }, { status: CollabStatus.EARLY_ACCESS }]
						}
					}
				}
			}
		});

		if (!character) {
			return {
				status: 404
			};
		}

		if (character.Pick.length > 0) {
			for (let i = 0; i < character.Pick.length; i++) {
				await deletePick(character.Pick[i]);
			}
		}

		await Prisma.client.animeCharacter.delete({
			where: {
				id: parseInt(id)
			}
		});

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};
