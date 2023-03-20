import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../database/prisma';
import type { Prisma as prisma } from '@prisma/client';

export const GET: RequestHandler = async ({ params, request }) => {
	const url = new URL(request.url);
	const query = url.searchParams.get('search')?.trim() ?? undefined;
	const page = parseInt(url.searchParams.get('page') ?? '1');

	const search = query?.split(' ');

	let OR: prisma.Enumerable<prisma.AnimeCharacterWhereInput> | undefined;

	if (search) {
		OR = [
			{ AND: search.map((s) => ({ name: { contains: s, mode: 'insensitive' } })) },
			{ AND: search.map((s) => ({ anime_name: { contains: s, mode: 'insensitive' } })) }
		];
	}

	const count = await Prisma.client.animeCharacter.count({
		where: {
			OR: OR
		}
	});

	const characters = await Prisma.client.animeCharacter.findMany({
		where: {
			OR: OR
		},
		include: {
			picks: {
				where: {
					collabId: params.id
				}
			}
		},
		take: 50,
		skip: 50 * (page - 1)
	});

	return {
		status: 200,
		body: {
			characters,
			count
		}
	};
};
