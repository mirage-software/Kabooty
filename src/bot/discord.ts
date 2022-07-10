import { Intents, Client } from 'discord.js';
import { Env } from '../env';

export abstract class DiscordBot {
	static _client: Client;

	static get client(): Client {
		if (!DiscordBot._client) {
			const env = Env.load();
			DiscordBot._client = new Client({ intents: [Intents.FLAGS.GUILDS] });
			DiscordBot._client.login(env['DISCORD_BOT_TOKEN']);
		}

		return DiscordBot._client;
	}
}
