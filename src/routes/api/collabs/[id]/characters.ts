import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../database/prisma';
import type { Prisma as prisma } from '@prisma/client';

export const get: RequestHandler = async ({ params, request }) => {
	const url = new URL(request.url);
	const query = url.searchParams.get('search')?.trim() ?? undefined;
	const page = parseInt(url.searchParams.get('page') ?? '1');

	const splitQuery = query?.split(' ');
	let fullTextSearch: prisma.Enumerable<prisma.AnimeCharacterWhereInput> | undefined;

	if (splitQuery) {
		fullTextSearch = splitQuery.map(query => ({
			OR: [
				{ name: { search: query.trim() } },
				{ anime_name: { search: query.trim() } },
			]
		}));
	}

	let orderBy: Array<object> = [
		{
			anime_name: 'desc'
		},
		{
			name: 'desc'
		}
	];

	const count = await Prisma.client.animeCharacter.count({
		where: {
			AND: fullTextSearch
		}
	});

	const characters = await Prisma.client.animeCharacter.findMany({
		where: {
			AND: fullTextSearch
		},
		include: {
			picks: {
				where: {
					collabId: params.id
				}
			}
		},
		orderBy: orderBy,
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
