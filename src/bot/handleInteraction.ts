
import { Env } from '../env';

export async function handleInteraction(interaction: any, client: any) {

    if (interaction.user.id === client.user.id) return;

    const env = Env.load();

    const channelId = env['DISCORD_REPORTS_CHANNEL_ID'];

    if (interaction.channel.id !== channelId) return;

    // This has to stay to avoid DiscordAPIError: Unknown interaction
    await interaction.deferUpdate();

    await interaction.message.delete();
}