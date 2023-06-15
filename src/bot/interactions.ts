import { REST } from '@discordjs/rest';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Routes } from 'discord-api-types/v9';
import type { ButtonInteraction, Client, CommandInteraction } from 'discord.js';
import { Env } from '../env';
import { Bumps } from '../cron/bumps';

export abstract class Interactions {
	static _initialized = false;

	static readonly buttons: { [key: string]: (interaction: ButtonInteraction) => void } = {
		report_close: Interactions.reportClose
	};

	static readonly commands: { [key: string]: (interaction: CommandInteraction) => void } = {
		bump: Interactions.bumpPicks
	};

	static async updateCommands(client: Client<true>) {
		const env = await Env.load();

		const rest = new REST({ version: '9' }).setToken(client.token);

		await rest.put(Routes.applicationCommands(env['DISCORD_CLIENT_ID']), {
			body: [
				new SlashCommandBuilder()
					.setName('bump')
					.setDescription('Bumps your picks')
					.setDMPermission(false)
					.toJSON()
			]
		});
	}

	static initialize(client: Client<true>): void {
		if (Interactions._initialized) {
			return;
		}

		Interactions._initialized = true;

		Interactions.updateCommands(client);

		client.on('interactionCreate', (interaction) => {
			if (interaction.isButton()) {
				Interactions.handleButton(interaction, client);
			}

			if (interaction.isCommand()) {
				Interactions.handleCommand(interaction, client);
			}
		});
	}

	static async handleButton(interaction: ButtonInteraction, client: Client<true>) {
		if (interaction.user.id === client.user.id) {
			return;
		}

		if (!interaction.deferred) {
			await interaction.deferUpdate();
		}

		const handler = Interactions.buttons[interaction.customId];

		if (handler) {
			handler(interaction);
		}
	}

	static async handleCommand(interaction: CommandInteraction, client: Client<true>) {
		if (interaction.user.id === client.user.id) {
			return;
		}

		const handler = Interactions.commands[interaction.commandName];

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

	static async bumpPicks(interaction: CommandInteraction) {
		const result = await Bumps.bump(interaction.user.id);

		interaction.reply({
			ephemeral: true,
			content: result ? 'Successfully bumped your picks.' : 'There is nothing to bump right now.'
		});
	}
}
