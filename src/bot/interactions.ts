import type { ButtonInteraction, Client } from 'discord.js';
import { Env } from '../env';

export abstract class Interactions {
	static _initialized = false;

	static readonly handlers: { [key: string]: (interaction: ButtonInteraction) => void } = {
		report_close: Interactions.reportClose
	};

	static initialize(client: Client<true>): void {
		client.on('interactionCreate', (interaction) => {
			if (!interaction.isButton()) return;
			Interactions.handleButton(interaction, client);
		});
	}

	static async handleButton(interaction: ButtonInteraction, client: Client<true>) {
		if (interaction.user.id === client.user.id) {
			return;
		}

		if (!interaction.deferred) {
			await interaction.deferUpdate();
		}

		const handler = Interactions.handlers[interaction.customId];

		if (handler) {
			handler(interaction);
		}
	}

	static reportClose(interaction: ButtonInteraction): void {
		const env = Env.load();

		const channelId = env['DISCORD_REPORTS_CHANNEL_ID'];

		if (interaction.channel?.id !== channelId || interaction.message.type !== 'DEFAULT') {
			return;
		}

		interaction.message.delete();
	}
}
