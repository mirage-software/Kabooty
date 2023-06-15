import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../database/prisma';

export const get: RequestHandler = async () => {
	// !! starts the server side application
	Prisma.client;

	return {
		status: 200
	};
};
