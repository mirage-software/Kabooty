interface IDiscordRole {
	id: string;
	name: string;
	display: boolean | null | undefined;
}

export interface IDiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null | undefined;
	admin: boolean;
	joinedAt: Date | string | null | undefined;
	roles: IDiscordRole[];
}
