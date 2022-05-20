import { DevConstants } from './constants.dev';

abstract class ProdConstants {
	public static readonly discordOAuth: string =
		'https://discord.com/api/oauth2/authorize?client_id=977208591696134264&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect%2Fdiscord&response_type=code&scope=identify%20guilds%20guilds.join';
}

export class Constants {
	public development: boolean;

	static _instance: Constants;

	static load(url: string): Constants {
		if (Constants._instance === undefined) {
			Constants._instance = new Constants(url);
		}
		return Constants._instance;
	}

	constructor(url: string) {
		this.development = url.includes('localhost');
	}

	public get discordOAuth(): string {
		return this.development ? DevConstants.discordOAuth : ProdConstants.discordOAuth;
	}
}
