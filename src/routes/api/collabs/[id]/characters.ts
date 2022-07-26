import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../database/prisma';

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

	const search = query?.split(' ').join(' & ');

	const OR = search ? [{ name: { search } }, { anime_name: { search } }] : undefined;

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
