import { PrismaClient } from '@prisma/client';

export abstract class Prisma {
	static _client: PrismaClient;

	static get client() {
		if (!Prisma._client) {
			Prisma._client = new PrismaClient();
		}

		return Prisma._client;
	}
}
