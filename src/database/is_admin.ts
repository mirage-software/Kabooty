import { Env } from '../env';
import { Prisma } from './prisma';

export async function isAdmin(userId: string): Promise<boolean> {
	const env = Env.load();

	const adminRoleId = env['DISCORD_ADMIN_ROLE_ID'];

	const admin = await Prisma.client.user.findFirst({
		where: {
			discordId: userId,
			AND: [
				{
					roles: {
						some: {
							userDiscordId: userId,
							discordRoleId: adminRoleId
						}
					}
				}
			]
		}
	});

	return admin ? true : false;
}
