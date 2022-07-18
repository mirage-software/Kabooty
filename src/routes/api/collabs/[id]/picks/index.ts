import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../../database/prisma';

export const get: RequestHandler = async ({ params }) => {
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

	// !! TODO: implement pagination ASAP
	const picks = await Prisma.client.pick.findMany({
		where: {
			collabId: collab.id
		},
		include: {
			User: true
		},
		orderBy: [
			{
				original: 'desc'
			},
			{
				createdAt: 'asc'
			}
		]
	});

	return {
		status: 200,
		body: picks
	};
};
