import { PrismaClient, type User } from '@prisma/client';
import { Cron } from '../cron/cron';

export abstract class Prisma {
	static _client: PrismaClient;

	// 	static async updateUser(user: User) {
	// 		await Prisma.client.user.update({
	// 			data: {
	// 'id': Prisma.client.user.
	// 			},
	// 			where: {
	// 				discordId: user.discordId
	// 			}
	// 		});
	// 	}

	// 	static async runMigrations() {
	// 		Prisma.client.user.findMany;
	// 	}

	static get client() {
		if (!Prisma._client) {
			Prisma._client = new PrismaClient();
			// Prisma._client.$use(async (params, next) => {
			// 	if (params.action === "create") {
			// 		params.args.data.id ??= createId()
			// 	}
			// 	return next(params)
			// })

			Cron.start();
		}

		return Prisma._client;
	}
}
