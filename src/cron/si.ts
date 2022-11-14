import { CronJob } from 'cron';
import { DiscordBot } from '../bot/discord';
import { Env } from '../env';

export abstract class Si {
	static started = false;
	static processing = false;

	static async start() {
		if (!Si.started) {
			Si.started = true;

			new CronJob('0 */2 * * *', Si.process, null, true);
		}
	}

	static async process() {
		const env = Env.load();

		const serverId = env['DISCORD_SERVER_ID'];
		const channelId = '730123180160843896';

		const name = '🌮・si';
		const topic = 'Formerly known as aleph';

		const guild = await DiscordBot.client.guilds.fetch({ guild: serverId });
		const channel = guild.channels.cache.get(channelId);

		await channel?.setName(name);

		if (channel?.type === 'GUILD_TEXT') {
			await channel.setTopic(topic);
		}
	}
}
