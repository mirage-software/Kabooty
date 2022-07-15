import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../database/prisma';

export const get: RequestHandler = async ({ params, request }) => {
	const url = new URL(request.url);
	const query = url.searchParams.get('search') ?? undefined;

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

	const characters = await Prisma.client.animeCharacter.findMany({
		where: {
			OR: [
				{ name: { contains: query, mode: 'insensitive' } },
				{ anime_name: { contains: query, mode: 'insensitive' } }
			]
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
