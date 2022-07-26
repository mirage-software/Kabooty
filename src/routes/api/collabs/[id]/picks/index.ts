import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../../database/prisma';

export const get: RequestHandler = async ({ params, request }) => {
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

	const url = new URL(request.url);
	// const query = url.searchParams.get('search') ?? '';
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const query = url.searchParams.get('query') ?? undefined;
	const sort = url.searchParams.get('sort') ?? undefined;
	const order = url.searchParams.get('order') ?? undefined;

	let orderBy: Array<object> = [
		{
			original: order ?? 'desc'
		},
		{
			character: {
				anime_name: (order ?? 'desc') === 'desc' ? 'asc' : 'desc'
			}
		},
		{
			name: order ?? 'desc'
		},
		{
			createdAt: order ?? 'desc'
		}
	];

	switch (sort) {
		case 'original': {
			orderBy = [{ original: order }];
			break;
		}
		case 'char': {
			orderBy.push({ name: order });
			break;
		}
		case 'date': {
			orderBy.push({
				createdAt: order
			});
			break;
		}
		case 'anime': {
			orderBy.push({
				character: {
					anime_name: order
				}
			});
			break;
		}
	}

	const picks = await Prisma.client.pick.findMany({
		where: {
			collabId: collab.id,
			OR: [
				{ name: { contains: query, mode: 'insensitive' } },
				{ character: { anime_name: { contains: query, mode: 'insensitive' } } }
			]
		},
		include: {
			User: true,
			character: true
		},
		orderBy: orderBy,
		take: 25,
		skip: 25 * (page - 1)
	});

	return {
		status: 200,
		body: picks
	};
};
