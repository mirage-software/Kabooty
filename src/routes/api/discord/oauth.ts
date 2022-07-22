import OAuth from 'discord-oauth2';
import { Env } from '../../../env';

export abstract class DiscordOAuth {
	static client = new OAuth();

	static getAuthorizeUrl(): string {
		const env = Env.load();

		return DiscordOAuth.client.generateAuthUrl({
			scope: ['identify', 'guilds', 'guilds.join'],
			clientId: env['DISCORD_CLIENT_ID'],
			redirectUri: env['DISCORD_REDIRECT_URI'],
			responseType: 'code'
		});
	}
}
