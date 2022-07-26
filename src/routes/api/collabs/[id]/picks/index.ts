import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../../database/prisma';
import type { Prisma as prisma } from '@prisma/client';

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
	const page = parseInt(url.searchParams.get('page') ?? '1');
	const query = url.searchParams.get('query')?.trim() ?? undefined;
	const sort = url.searchParams.get('sort') ?? undefined;
	const order = url.searchParams.get('order') ?? 'desc';

	const search = query?.split(' ');

	let orderBy: Array<object> = [
		{
			original: order
		},
		{
			character: {
				anime_name: order === 'desc' ? 'asc' : 'desc'
			}
		},
		{
			name: order
		},
		{
			createdAt: order
		}
	];

	switch (sort) {
		case 'original': {
			orderBy = [{ original: order }];
			break;
		}
		case 'char': {
			orderBy = [
				{
					name: order
				},
				{
					character: {
						anime_name: order === 'desc' ? 'asc' : 'desc'
					}
				}
			];
			break;
		}
		case 'date': {
			orderBy = [
				{
					createdAt: order
				}
			];
			break;
		}
		case 'anime': {
			orderBy = [
				{ original: order },
				{
					character: {
						anime_name: order === 'desc' ? 'asc' : 'desc'
					}
				},
				{
					name: order
				}
			];
			break;
		}
	}

	let OR: prisma.Enumerable<prisma.PickWhereInput> | undefined;

	if (search) {
		OR = [
			{ AND: search.map((s) => ({ name: { contains: s, mode: 'insensitive' } })) },
			{
				AND: search.map((s) => ({
					character: { anime_name: { contains: s, mode: 'insensitive' } }
				}))
			}
		];
	}

	const picks = await Prisma.client.pick.findMany({
		where: {
			collabId: collab.id,
			OR: OR
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
