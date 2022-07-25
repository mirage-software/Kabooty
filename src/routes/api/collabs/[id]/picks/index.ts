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

	const picks = await Prisma.client.pick.findMany({
		where: {
			collabId: collab.id
		},
		include: {
			User: true,
			character: true
		},
		orderBy: [
			{
				original: 'desc'
			},
			{
				createdAt: 'desc'
			}
		],
		take: 25,
		skip: 25 * (page - 1)
	});

	return {
		status: 200,
		body: picks
	};
};
