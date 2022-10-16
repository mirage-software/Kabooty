import type { RequestHandler } from '@sveltejs/kit';

import cookie from 'cookie';
import { Jwt } from '../../../jwt';
import { Prisma } from '../../../database/prisma';
import { Env } from '../../../env';
import { SentryClient } from '../../../bot/sentry';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { MessageEmbed } from 'discord.js';
import { DiscordBot } from '../../../bot/discord';
import type { Asset, CollabAsset, Pick } from '@prisma/client';
import { ServerPaths } from '../../../utils/paths/server';
import type { IDiscordUser } from '../../../utils/discord/interfaces/user';
import { DiscordUser } from '../../../utils/discord/user';

async function sendEmbedToDiscord(data: {
	asset: CollabAsset;
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

	const message = `<@${data.pick.userId}>, your **${data.asset.assetName}** has been deleted by <@${data.user.id}>`;

	const embed: MessageEmbed = new MessageEmbed({
		title: `**Asset Deletion Notification**`,
		description: `Your **${data.asset.assetName}** has been deleted for the following reason\n**${data.reason}**`,
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

export async function deleteImage(asset: Asset): Promise<void> {
	if (!asset) {
		throw new Error('Asset not found');
	}

	const filePath = path.join(
		ServerPaths.asset(asset.collabId, asset.pickId, asset.collabAssetId),
		asset.image
	);

	if (existsSync(filePath)) {
		unlinkSync(filePath);
	}

	await Prisma.client.asset.delete({
		where: {
			id: asset.id
		}
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
		const user = await DiscordUser.getUser(userId, token);

		if (!user || !user.admin) {
			return {
				status: 403
			};
		}

		const assetId = params['id'];

		const asset = await Prisma.client.asset.findUnique({
			where: {
				id: assetId
			},
			include: {
				pick: true,
				collabAsset: true
			}
		});

		if (!asset) {
			return {
				status: 404
			};
		}

		await Prisma.client.log.create({
			data: {
				action: 'admin_delete_asset_image',
				userId: userId,
				data: JSON.stringify(asset)
			}
		});

		await deleteImage(asset);

		await sendEmbedToDiscord({ asset: asset.collabAsset, pick: asset.pick, user, reason });

		return {
			status: 200
		};
	} catch (error) {
		console.log(error);
		SentryClient.log(error);

		return {
			status: 500
		};
	}
};
