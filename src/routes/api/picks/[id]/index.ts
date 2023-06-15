import { CollabStatus, type AnimeCharacter, type Asset, type Pick } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { existsSync, unlinkSync } from 'fs';
import { DiscordBot } from '../../../../bot/discord';
import path from 'path';
import { Prisma } from '../../../../database/prisma';
import { Env } from '../../../../env';
import cookie from 'cookie';
import { Jwt } from '../../../../jwt';
import { SentryClient } from '../../../../bot/sentry';
import { MessageEmbed } from 'discord.js';
import { ServerPaths } from '../../../../utils/paths/server';
import type { IDiscordUser } from '../../../../utils/discord/interfaces/user';
import { DiscordUser } from '../../../../utils/discord/user';

export async function sendEmbedToDiscord(data: {
	pick: Pick;
	user: IDiscordUser;
	reason: string | null;
}) {
	const env = Env.load();
	const serverId = env['DISCORD_SERVER_ID'];
	const channelId = env['DISCORD_DELETIONS_CHANNEL_ID'];

	if (!data.reason) {
		data.reason = 'No Reason Given';
	}

	const message = `<@${data.pick.userId}>, your pick **${data.pick.name}** has been deleted by <@${data.user.id}>`;

	const embed: MessageEmbed = new MessageEmbed({
		title: `**Deletion Notification**`,
		description: `Your pick **${data.pick.name}** has been deleted for the following reason\n**${data.reason}**`,
		color: 0xff0000,
		fields: [
			{
				name: 'Picked Character',
				value: data.pick.name,
				inline: true
			},
			{
				name: 'Picked by ID',
				value: data.pick.userId,
				inline: true
			},
			{
				name: 'Deleted by ID',
				value: data.user.id,
				inline: true
			},
			{
				name: 'Pick ID',
				value: data.pick.id,
				inline: true
			}
		]
	});

	const guild = await DiscordBot.client.guilds.fetch({ guild: serverId });
	const channel = guild.channels.cache.get(channelId);
	if (channel && channel.type === 'GUILD_TEXT') {
		await channel.send({
			content: message,
			embeds: [embed]
		});
	}
}

export async function deletePick(pick: Pick & { assets: Asset[] }): Promise<void> {
	if (!pick || !pick.id || !pick.collabId || !pick.assets) {
		throw new Error('Pick not found');
	}

	for (let i = 0; i < pick.assets.length; i++) {
		const asset = pick.assets[i];

		const filePath = path.join(
			ServerPaths.asset(pick.collabId, pick.id, asset.collabAssetId),
			asset.image
		);

		if (existsSync(filePath)) {
			unlinkSync(filePath);
		}
	}

	await Prisma.client.pick.delete({
		where: {
			id: pick.id
		}
	});
}

export const get: RequestHandler = async ({ params }) => {
	if (!params.id) {
		throw new Error('No ID parameter provided');
	}

	const pick = await Prisma.client.pick.findUnique({
		where: {
			id: params.id
		},
		include: {
			assets: {
				include: {
					collabAsset: true
				}
			},
			character: true,
			collab: {
				include: {
					collabAssets: true
				}
			},
			user: true
		}
	});

	if (!pick) {
		return {
			status: 404,
			body: {
				message: 'Pick not found'
			}
		};
	}

	return {
		status: 200,
		body: pick
	};
};

export const put: RequestHandler = async ({ request, params }) => {
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

	if (!params.id) {
		throw new Error('No ID parameter provided');
	}

	try {
		const user = await DiscordUser.getUser(userId, token);

		if (!user) {
			return {
				status: 403
			};
		}

		const body: Partial<Pick> = await request.json();

		if (
			!body.characterId &&
			!body.extra &&
			!body.name &&
			!(body.valid === false || body.valid === true)
		) {
			return {
				status: 400
			};
		}

		const pick = await Prisma.client.pick.findUnique({
			where: {
				id: params.id
			},
			include: {
				collab: true
			}
		});

		if (!pick) {
			return {
				status: 404
			};
		}

		if (userId !== pick.userId || !pick.collab.allowEditing) {
			if (!user.admin) {
				return {
					status: 403
				};
			} else {
				await Prisma.client.log.create({
					data: {
						action: 'admin_update_pick',
						userId: userId,
						data: { id: params.id, pick: JSON.stringify(pick), update: JSON.stringify(body) }
					}
				});
			}
		}

		let characterId: number | undefined;
		let character: AnimeCharacter | null = null;
		let original: boolean | undefined;

		if (body.characterId) {
			character = await Prisma.client.animeCharacter.findUnique({
				where: {
					id: body.characterId
				}
			});

			if (character) {
				characterId = character.id;
			}
		}

		if (body.original) {
			original = body.original;
		}

		const update: Partial<Pick> = pick;

		if (!original && characterId && characterId !== pick.characterId && character) {
			const pickedCharacter = await Prisma.client.pick.findUnique({
				where: {
					collabId_characterId: {
						collabId: pick.collabId,
						characterId: characterId
					}
				}
			});

			if (pickedCharacter) {
				return {
					status: 400
				};
			}

			update.characterId = character.id;
			update.original = false;
			update.name = character.name;
		}

		if (original && body.name) {
			update.characterId = null;
			update.original = true;
			update.name = body.name;
		}

		await Prisma.client.pick.update({
			where: {
				id: params.id
			},
			data: {
				characterId: update.characterId,
				original: update.original,
				extra: body.extra ?? undefined,
				name: update.name,
				valid: body.valid
			}
		});

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 500
		};
	}
};

export const del: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	const requestJson = await request.json();
	const reason = requestJson.reason;

	if (!token) {
		return {
			status: 401
		};
	}

	try {
		const user = await DiscordUser.getUser(userId, token);

		if (!user) {
			return {
				status: 403
			};
		}

		if (!params.id) {
			throw new Error('No ID parameter provided');
		}

		const pick = await Prisma.client.pick.findUnique({
			where: {
				id: params.id
			},
			include: {
				collab: true,
				assets: true
			}
		});

		if (!pick) {
			return {
				status: 404
			};
		}

		if (pick.userId !== userId) {
			if (user.admin) {
				await Prisma.client.log.create({
					data: {
						action: 'admin_delete_pick',
						userId: userId,
						data: JSON.stringify(pick)
					}
				});

				await deletePick(pick);
				sendEmbedToDiscord({ pick, user, reason });

				return {
					status: 200
				};
			} else {
				return {
					status: 403
				};
			}
		} else {
			if (
				pick.collab.status === CollabStatus.OPEN ||
				pick.collab.status === CollabStatus.EARLY_ACCESS
			) {
				await deletePick(pick);

				return {
					status: 200
				};
			} else {
				return {
					status: 403
				};
			}
		}
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 500
		};
	}
};
