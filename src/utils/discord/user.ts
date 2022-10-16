import OAuth from 'discord-oauth2';
import { DiscordBot } from '../../bot/discord';
import { isAdmin } from '../../database/is_admin';
import { Prisma } from '../../database/prisma';
import { Env } from '../../env';
import type { IDiscordUser } from './interfaces/user';

export abstract class DiscordUser {
	static async create(user: IDiscordUser) {
		return await Prisma.client.user.create({
			data: {
				discordId: user.id,
				avatar: user.avatar,
				discriminator: user.discriminator,
				username: user.username,
				creation_date: user.creation_date
			}
		});
	}

	static async update(userId: string, token: string | undefined = undefined) {
		const env = Env.load();

		const updatedBefore = new Date(Date.now() - 1000 * 60 * 15);

		const prismaUser = await Prisma.client.user.findUnique({
			where: {
				discordId: userId
			}
		});

		let user: IDiscordUser | null | undefined;
		let lastUpdated: Date | undefined;

		if (!token) {
			if (!prismaUser?.lastUpdated || prismaUser.lastUpdated < updatedBefore) {
				const _user = await DiscordBot.client.users.fetch(userId);

				user = {
					id: _user.id,
					avatar: _user.avatar,
					discriminator: _user.discriminator,
					username: _user.username,
					joinedAt: undefined,
					admin: false,
					roles: [],
					creation_date: _user.createdAt
				};

				try {
					if (!prismaUser) {
						await DiscordUser.create(user);
					}

					const guildId = env['DISCORD_SERVER_ID'];
					await DiscordUser.updateGuildUser(userId, guildId);
				} catch (error) {
					// !! Do nothing, since the user may not be in the guild
				}

				lastUpdated = new Date();
			}
		} else {
			const client = new OAuth({
				clientId: env['DISCORD_CLIENT_ID'],
				clientSecret: env['DISCORD_CLIENT_SECRET']
			});

			const discord = await client.getUser(token);

			if (!discord) {
				throw new Error('Token provided is invalid');
			}

			user = {
				id: discord.id,
				username: discord.username,
				discriminator: discord.discriminator,
				avatar: discord.avatar,
				joinedAt: undefined,
				admin: false,
				roles: [],
				creation_date: undefined
			};

			if (!prismaUser?.lastUpdated || prismaUser.lastUpdated < updatedBefore) {
				try {
					if (!prismaUser) {
						await DiscordUser.create(user);
					}

					const guildId = env['DISCORD_SERVER_ID'];
					await DiscordUser.updateGuildUser(userId, guildId);

					lastUpdated = new Date();
				} catch (error) {
					// !! Do nothing, since the user may not be in the guild
				}
			}
		}

		if (!user) {
			// !! can we assume in this scenario that the user no longer exists on Discord?
			// if so, we should anonimize the account
			return;
		}

		await Prisma.client.user.update({
			where: {
				discordId: user.id
			},
			data: {
				discordId: user.id,
				username: user.username,
				discriminator: user.discriminator,
				avatar: user.avatar,
				lastUpdated,
				creation_date: user.creation_date
			}
		});
	}

	static async updateGuildUser(userId: string, guildId: string) {
		const guild = await DiscordBot.client.guilds.fetch({ guild: guildId });
		const guildUser = await guild.members.fetch({ user: userId });

		const roles = [];

		for (const role of guildUser.roles.valueOf()) {
			roles.push({
				id: role[0],
				name: role[1].name,
				display: undefined
			});
		}

		console.log(roles);

		if (!guildUser) {
			await Prisma.client.user.update({
				where: {
					discordId: userId
				},
				data: {
					joinedAt: null
				}
			});
			throw new Error('No user found');
		}

		await Prisma.client.userRole.deleteMany({
			where: {
				AND: [
					{ userDiscordId: userId },
					{
						discordRoleId: {
							notIn: roles.map((role) => role.id)
						}
					}
				]
			}
		});

		for (const role of roles) {
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

		for (let i = 0; i < roles.length; i++) {
			const role = roles[i];

			Prisma.client.userRole.upsert({
				where: {
					userDiscordId_discordRoleId: {
						userDiscordId: userId,
						discordRoleId: role.id
					}
				},
				update: {
					userDiscordId: userId,
					discordRoleId: role.id
				},
				create: {
					userDiscordId: userId,
					discordRoleId: role.id
				}
			});
		}

		await Prisma.client.user.update({
			where: {
				discordId: userId
			},
			data: {
				joinedAt: guildUser.joinedAt,
				creation_date: guildUser.user.createdAt
			}
		});
	}

	static async getUser(userId: string, token: string | undefined = undefined) {
		try {
			await DiscordUser.update(userId, token);
		} catch (error) {
			return;
		}

		const response = await Prisma.client.user.findUnique({
			where: {
				discordId: userId
			},
			include: {
				roles: {
					where: {
						userDiscordId: userId
					},
					include: {
						role: true
					}
				}
			}
		});

		if (!response) {
			throw new Error('No user found');
		}

		const transformed: IDiscordUser = {
			id: response.discordId,
			username: response.username,
			discriminator: response.discriminator,
			avatar: response.avatar,
			joinedAt: response.joinedAt,
			admin: token ? await isAdmin(userId) : false,
			roles: response.roles.map((role) => ({
				id: role.role.id,
				name: role.role.name,
				display: role.role.display
			})),
			creation_date: response.creation_date
		};

		return transformed;
	}
}
