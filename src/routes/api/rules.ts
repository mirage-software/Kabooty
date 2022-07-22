import type { RequestHandler } from '@sveltejs/kit';
import { SentryClient } from '../../bot/sentry';
import { DiscordBot } from '../../bot/discord';
import { Env } from '../../env';

export const get: RequestHandler = async () => {
	try {
		const env = Env.load();

		const serverId = env['DISCORD_SERVER_ID'];
		const channelId = env['DISCORD_RULES_CHANNEL_ID'];

		const guild = await DiscordBot.client.guilds.fetch({ guild: serverId });
		const channel = await guild.channels.fetch(channelId);

		if (!channel || channel.type !== 'GUILD_TEXT') {
			return {
				status: 404
			};
		}

		const messages = await channel.messages.fetch();

		return {
			status: 200,
			body: messages.at(0)?.content
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};
