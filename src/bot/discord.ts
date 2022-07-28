import { Intents, Client } from 'discord.js';
import { Env } from '../env';
import { handleInteraction } from './handleInteraction';

export abstract class DiscordBot {
	static _client: Client;

	static get client(): Client {
		if (!DiscordBot._client) {
			const env = Env.load();
			DiscordBot._client = new Client({ intents: [Intents.FLAGS.GUILDS] });
			DiscordBot._client.login(env['DISCORD_BOT_TOKEN']);

			DiscordBot._client.once('ready', c => {
				c.on('interactionCreate', (interaction) => {
					handleInteraction(interaction, c);
				});
			});
		}

		return DiscordBot._client;
	}

}
