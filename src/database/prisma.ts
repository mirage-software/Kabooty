import { PrismaClient } from '@prisma/client';
import { Cron } from '../cron/cron';

export abstract class Prisma {
	static _client: PrismaClient;

	static get client() {
		if (!Prisma._client) {
			Prisma._client = new PrismaClient();
			Cron.start();
		}

		return Prisma._client;
	}
}
