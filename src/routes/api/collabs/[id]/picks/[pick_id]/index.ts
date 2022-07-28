import { CollabStatus, type Pick , type User} from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { existsSync, unlinkSync } from 'fs';
import { DiscordBot } from '../../../../../../bot/discord';
import path from 'path';
import { Prisma } from '../../../../../../database/prisma';
import { Env } from '../../../../../../env';
import cookie from 'cookie';
import { Jwt } from '../../../../../../jwt';
import { getUpdatedDiscordUser, getUser } from '../../../../discord/user';
import { SentryClient } from '../../../../../../bot/sentry';
import { MessageEmbed } from 'discord.js';
import type { IDiscordUser } from 'src/database/discord_user';


async function sendEmbedToDiscord(data: {
	pick: Pick,
	user: IDiscordUser,
	reason: string | null,
}) {
	const env = Env.load();
	const serverId = env['DISCORD_SERVER_ID'];
	const channelId = env['DISCORD_DELETIONS_CHANNEL_ID'];

	if (!data.reason) {
		data.reason = "No Reason Given"
	}

	const embed: MessageEmbed = new MessageEmbed({
		title: `**Deletion Notification**`,
		description: `Your character has been deleted for the following reason:\n**${data.reason}**`,
		color: 0xff0000,
		fields: [
			{
				name: 'Picked Character',
				value: data.pick.name,
				inline: true
			},
			{
				name: 'Picked by',
				value: `<@${data.pick.userId}>`,
				inline: true
			},
			{
				name: 'Deleted by',
				value: `<@${data.user.id}>`,
			},
			{
				name: 'Pick ID',
				value: data.pick.id,
				inline: true
			},
			{
				name: 'Deletor ID',
				value: `${data.user.id}`,
				inline: true
			},
		]
	});

	const guild = await DiscordBot.client.guilds.fetch({ guild: serverId });
	const channel = guild.channels.cache.get(channelId);
	if (channel && channel.type === 'GUILD_TEXT') {
		const msg = await channel.send(`<@${data.pick.userId}>`);
		msg.reply({ embeds: [embed] });
	}
}

export async function deletePick(pick: Pick, user: IDiscordUser, reason: string | null): Promise<void> {
	if (!pick) {
		throw new Error('Pick not found');
	}
	const env = Env.load();

	sendEmbedToDiscord({ pick, user, reason })

	if (pick.image) {
		const filePath = path.join(
			env['FILE_STORAGE_PATH'],
			'collabs',
			pick.collabId,
			'picks',
			pick.image
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

export const patch: RequestHandler = async ({ request, params }) => {
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

		if (!user || !user.admin) {
			return {
				status: 403
			};
		}

		const body = await request.json();

		if (!body.characterId) {
			return {
				status: 400
			};
		}

		const characterId = parseInt(body.characterId);

		const character = await Prisma.client.animeCharacter.findUnique({
			where: {
				id: characterId
			}
		});

		if (!character) {
			return {
				status: 404
			};
		}

		const pickId = params['pick_id'];

		const pick = await Prisma.client.pick.findUnique({
			where: {
				id: pickId
			}
		});

		if (!pick) {
			return {
				status: 404
			};
		}

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

		await Prisma.client.log.create({
			data: {
				action: 'admin_link_pick',
				userId: user.id,
				data: { id: pickId, characterId: characterId }
			}
		});

		await Prisma.client.pick.update({
			where: {
				id: pickId
			},
			data: {
				characterId: characterId,
				original: false,
				name: character.name
			}
		});

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);
		console.log(error);

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

	const urlParams = new URLSearchParams(request.url.split('?')[1]);
	const reason = urlParams.get('reason')

	if (!token) {
		return {
			status: 401
		};
	}

	try {
		const user = await getUser(token, userId);

		if (!user) {
			return {
				status: 403
			};
		}

		const pickId = params['pick_id'];

		const pick = await Prisma.client.pick.findUnique({
			where: {
				id: pickId
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

		if (pick.userId !== user.id) {
			if (user.admin) {
				await Prisma.client.log.create({
					data: {
						action: 'admin_delete_pick',
						userId: user.id,
						data: JSON.stringify(pick)
					}
				});

				await deletePick(pick, user, reason);

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
				pick.collab.status === CollabStatus.BUMP ||
				pick.collab.status === CollabStatus.OPEN ||
				pick.collab.status === CollabStatus.EARLY_ACCESS
			) {
				await deletePick(pick, user, reason);

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
