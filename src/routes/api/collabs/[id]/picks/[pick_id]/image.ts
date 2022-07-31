import type { RequestHandler } from '@sveltejs/kit';

import cookie from 'cookie';
import { type Pick } from '@prisma/client';
import { Jwt } from '../../../../../../jwt';
import { getUser } from '../../../../discord/user';
import { Prisma } from '../../../../../../database/prisma';
import { Env } from '../../../../../../env';
import { SentryClient } from '../../../../../../bot/sentry';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import type { IDiscordUser } from 'src/database/discord_user';
import { MessageEmbed } from 'discord.js';
import { DiscordBot } from '../../../../../../bot/discord';

async function sendEmbedToDiscord(data: { pick: Pick; user: IDiscordUser; reason: string | null }) {
	const env = Env.load();
	const serverId = env['DISCORD_SERVER_ID'];
	const channelId = env['DISCORD_DELETIONS_CHANNEL_ID'];

	if (!data.reason) {
		data.reason = 'No Reason Given';
	}

	const embed: MessageEmbed = new MessageEmbed({
		title: `**Image Deletion Notification**`,
		description: `Your **image** has been deleted for the following reason\n**${data.reason}**`,
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
				value: `<@${data.user.id}>`
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
		const msg = await channel.send(`<@${data.pick.userId}>`);
		msg.reply({ embeds: [embed] });
	}
}

export async function deleteImage(pick: Pick): Promise<void> {
	if (!pick) {
		throw new Error('Pick not found');
	}

	const env = Env.load();

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

	await Prisma.client.pick.update({
		where: {
			id: pick.id
		},
		data: { image: null }
	});
}

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
		const user = await getUser(token, userId);

		if (!user) {
			return {
				status: 403
			};
		}

		if (user.admin) {
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

			await Prisma.client.log.create({
				data: {
					action: 'admin_delete_pick_image',
					userId: user.id,
					data: JSON.stringify(pick)
				}
			});

			await deleteImage(pick);

			await sendEmbedToDiscord({ pick, user, reason });

			return {
				status: 200
			};
		} else {
			return {
				status: 403
			};
		}
	} catch (error) {
		console.log(error);
		SentryClient.log(error);

		return {
			status: 500
		};
	}
};
