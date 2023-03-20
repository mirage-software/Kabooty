import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../database/prisma';

export const GET: RequestHandler = async () => {
	// !! starts the server side application
	Prisma.client;

	return new Response(undefined);
};
