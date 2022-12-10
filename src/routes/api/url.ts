import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../database/prisma';

export const get: RequestHandler = async ({ request }) => {
	const url = new URL(request.url);
	const query = url.searchParams.get('search')?.trim() ?? undefined;

	if (query === undefined || query === null) {
		return {
			status: 200,
			body: true
		};
	}

	const collab = await Prisma.client.collab.findMany({
		where: {
			url: query
		}
	});

	if (collab.length === 0) {
		return {
			status: 200,
			body: true
		};
	} else {
		return {
			status: 200,
			body: false
		};
	}
};
