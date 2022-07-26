import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../database/prisma';
import type { Prisma as prisma } from '@prisma/client';

export const get: RequestHandler = async ({ params, request }) => {
	const url = new URL(request.url);
	const query = url.searchParams.get('search')?.trim() ?? undefined;

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

	const search = query?.split(' ');

	let OR: prisma.Enumerable<prisma.AnimeCharacterWhereInput> | undefined;

	if (search) {
		OR = [
			{ AND: search.map((s) => ({ name: { contains: s, mode: 'insensitive' } })) },
			{ AND: search.map((s) => ({ anime_name: { contains: s, mode: 'insensitive' } })) }
		];
	}

	const characters = await Prisma.client.animeCharacter.findMany({
		where: {
			OR: OR
		},
		include: {
			Pick: {
				where: {
					collabId: params.id
				}
			}
		},
		take: 50
	});

	return {
		status: 200,
		body: characters
	};
};
