import type { IDiscordRole } from './role';

export interface IDiscordUser {
	id: string;
	username: string;
	discriminator?: string | null;
	avatar: string | null | undefined;
	admin: boolean;
	joinedAt: Date | string | null | undefined;
	roles: IDiscordRole[];
	creation_date: Date | string | null | undefined;
}
