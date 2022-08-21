import { Intents, Client } from 'discord.js';
import { Env } from '../env';
import { Interactions } from './interactions';

export abstract class DiscordBot {
	static _client: Client;

	static get client(): Client {
		if (!DiscordBot._client) {
			const env = Env.load();
			DiscordBot._client = new Client({
				intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
				presence: {
					activities: [
						{
							type: 'WATCHING',
							name: 'you sleep'
						}
					]
				}
			});
			DiscordBot._client.login(env['DISCORD_BOT_TOKEN']);

			DiscordBot._client.once('ready', Interactions.initialize);
		}
		return DiscordBot._client;
	}
}
