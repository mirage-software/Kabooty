import type {
	Collab,
	CollabAsset,
	CollabEarlyAccess,
	Guild,
	GuildRole,
	UserGuildRole
} from '@prisma/client';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, depends }) => {
	const requestSize = 50;
	const sorts = ['default', 'size', 'status'];
	const requests = await Promise.all([fetch('/api/collabs?page=1&sort=default&order=asc')]);
	depends('app:collabs');
	depends('app:auth:signedin');
	return {
		collabs: <
			(Collab & {
				guild:
					| (Guild & {
							userRoles: UserGuildRole[];
					  })
					| null;
				collabAssets: CollabAsset[];
				earlyAccessRoles: (CollabEarlyAccess & {
					guildRole: GuildRole;
				})[];
				_count: {
					participants: number;
				};
			})[]
		>await requests[0].json(),
		sorts: sorts,
		requestSize: requestSize
	};
};
