import type { RequestHandler } from '@sveltejs/kit';
import OAuth from 'discord-oauth2';
import { Env } from '../../../env';
import cookie from 'cookie';
import { Prisma } from '../../../database/prisma';
import { Jwt } from '../../../jwt';
import type { IDiscordUser } from '../../../database/discord_user';
import { DiscordBot } from '../../../bot/discord';
import { isAdmin } from '../../../database/is_admin';

export interface IDiscordAccessToken extends Record<string, string | number> {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export async function getUser(token: string, userId: string) {
	const env = Env.load();

	const client = new OAuth({
		clientId: env['DISCORD_CLIENT_ID'],
		clientSecret: env['DISCORD_CLIENT_SECRET']
	});

	const prismaUser = await Prisma.client.user.findUnique({
		where: {
			discordId: userId
		}
	});

	let user: IDiscordUser | null | undefined;

	const serverId = env['DISCORD_SERVER_ID'];

	let discord: OAuth.User | null | undefined;
	let lastUpdated: Date | null | undefined;

	if (!prismaUser?.lastUpdated || prismaUser.lastUpdated < new Date(Date.now() - 1000 * 60 * 60)) {
		try {
			const guild = await DiscordBot.client.guilds.fetch({ guild: serverId });
			const guildUser = await guild.members.fetch({ user: userId });

			const roles = [];

			for (const role of guildUser.roles.cache) {
				roles.push({
					id: role[0],
					name: role[1].name,
					display: undefined
				});
			}

			lastUpdated = new Date();

			if (!guildUser) {
				throw new Error('No user found');
			}

			user = {
				id: guildUser.user.id,
				username: guildUser.user.username,
				discriminator: guildUser.user.discriminator,
				avatar: guildUser.user.avatar,
				joinedAt: guildUser.joinedAt,
				admin: false,
				roles: roles
			};
		} catch (error) {
			discord = await client.getUser(token);
		}
	} else {
		discord = await client.getUser(token);
	}

	if (discord && !user) {
		user = {
			id: discord.id,
			username: discord.username,
			discriminator: discord.discriminator,
			avatar: discord.avatar,
			joinedAt: undefined,
			admin: false,
			roles: []
		};
	}

	if (!user) {
		throw new Error('No user found');
	}

	await Prisma.client.user.upsert({
		where: {
			discordId: user.id
		},
		update: {
			discordId: user.id,
			username: user.username,
			discriminator: user.discriminator,
			avatar: user.avatar,
			joinedAt: user.joinedAt ?? prismaUser?.joinedAt,
			lastUpdated: lastUpdated ?? prismaUser?.lastUpdated
		},
		create: {
			discordId: user.id,
			username: user.username,
			discriminator: user.discriminator,
			avatar: user.avatar,
			joinedAt: user.joinedAt ?? prismaUser?.joinedAt,
			lastUpdated: lastUpdated ?? prismaUser?.lastUpdated
		}
	});

	if (lastUpdated) {
		await Prisma.client.userRole.deleteMany({
			where: {
				userDiscordId: userId
			}
		});

		for (const role of user.roles) {
			await Prisma.client.discordRole.upsert({
				where: {
					id: role.id
				},
				update: {
					id: role.id,
					name: role.name
				},
				create: {
					id: role.id,
					name: role.name
				}
			});
		}

		await Prisma.client.userRole.createMany({
			data: user.roles.map((role) => ({
				userDiscordId: userId,
				discordRoleId: role.id
			}))
		});
	}

	const response = await Prisma.client.user.findUnique({
		where: {
			discordId: userId
		},
		include: {
			roles: {
				where: {
					userDiscordId: userId,
					role: {
						display: true
					}
				},
				include: {
					role: true
				}
			}
		}
	});

	if (!response) {
		throw new Error('No user found (during a second lookup)');
	}

	const transformed: IDiscordUser = {
		id: response.discordId,
		username: response.username,
		discriminator: response.discriminator,
		avatar: response.avatar,
		joinedAt: response.joinedAt,
		admin: await isAdmin(userId),
		roles: response.roles.map((role) => ({
			id: role.role.id,
			name: role.role.name,
			display: role.role.display
		}))
	};

	return transformed;
}

export const get: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	if (!token) {
		return {
			status: 401
		};
	}

	try {
		const user = await getUser(token, userId);

		return {
			status: 200,
			body: JSON.stringify(user)
		};
	} catch (error) {
		return {
			status: 400,
			body: {
				error: 'Failed to get user'
			}
		};
	}
};
