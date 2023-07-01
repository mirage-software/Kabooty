import type { RequestHandler } from '@sveltejs/kit';

import cookie from 'cookie';
import type { Collab, Pick, User } from '@prisma/client';
import { Jwt } from '../../../../jwt';
import { Prisma } from '../../../../database/prisma';
import { DiscordBot } from '../../../../bot/discord';
import { Env } from '../../../../env';
import { SentryClient } from '../../../../bot/sentry';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { DiscordUser } from '../../../../utils/discord/user';
import { getUserName } from '../../../../stores/discord';

async function sendEmbedToDiscord(
	pick: Pick & { user: User | null; collab: Collab },
	reporter: User,
	report: string
) {
	if (!pick.user) {
		return;
	}

	const env = Env.load();

	const serverId = env['DISCORD_SERVER_ID'];
	const channelId = env['DISCORD_REPORTS_CHANNEL_ID'];

	const mention = `<@${pick.user.discordId}>`;
	const reporterMention = `<@${reporter.discordId}>`;

	const embed: MessageEmbed = new MessageEmbed({
		title: `Pick report from ${getUserName(reporter)}`,
		description: `Message: **${report}**`,
		color: 0xff0000,
		fields: [
			{
				name: 'Pick user',
				value: `${mention}`,
				inline: true
			},
			{
				name: 'Pick character',
				value: `${pick.name}`,
				inline: true
			},
			{
				name: 'Pick user ID',
				value: `${pick.user.discordId}`,
				inline: true
			},
			{
				name: 'Pick ID',
				value: `${pick.id}`,
				inline: true
			},
			{
				name: 'Reporter',
				value: `${reporterMention}`,
				inline: true
			},
			{
				name: 'Reporter user ID',
				value: `${reporter.discordId}`,
				inline: true
			}
		]
	});

	const guild = await DiscordBot.client.guilds.fetch({ guild: serverId });
	const channel = guild.channels.cache.get(channelId);

	if (channel && channel.type === 'GUILD_TEXT') {
		const msg = await channel.send({ embeds: [embed] });

		const row = new MessageActionRow();

		const close = new MessageButton()
			.setCustomId(`report_close`)
			.setLabel('Close Report')
			.setDisabled(false)
			.setStyle('DANGER');

		row.addComponents([close]);

		await msg.edit({ embeds: [embed], components: [row] });
	}
}

export const post: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	const report: string | undefined | null = (await request.json()).report;

	if (!report) {
		return {
			status: 400
		};
	}

	try {
		if (!token) {
			return {
				status: 401,
				body: {
					message: 'errors.unauthorized'
				}
			};
		}

		const discordUser = await DiscordUser.getUser(userId, token);

		if (!discordUser) {
			return {
				status: 403,
				body: {
					message: 'errors.unauthorized'
				}
			};
		}

		const user = await Prisma.client.user.findUnique({
			where: {
				discordId: userId
			}
		});

		if (!user) {
			return {
				status: 404,
				body: {
					message: 'errors.user_not_found'
				}
			};
		}

		const pick = await Prisma.client.pick.findUnique({
			where: {
				id: params.id
			},
			include: {
				user: true,
				collab: true
			}
		});

		if (!pick) {
			return {
				status: 404,
				body: {
					message: 'errors.pick_not_found'
				}
			};
		}

		sendEmbedToDiscord(pick, user, report);

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error, await request.json());

		return {
			status: 400
		};
	}
};
