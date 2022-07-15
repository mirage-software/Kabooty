import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../database/prisma';
import cookie from 'cookie';
import { Jwt } from '../../../../jwt';
import { getOsuUser, type IOsuAccessToken } from '../access';
import axios from 'axios';
import { Env } from '../../../../env';
import { canUpdateOsu } from './can_update';
import { SentryClient } from '../../../../bot/sentry';

export const get: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decodedToken = Jwt.decode(cookies['discord_token']);
	const token = decodedToken['access_token'] as string;

	if (!token) {
		return {
			status: 401
		};
	}

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	const gamemode = params.gamemode;

	switch (gamemode) {
		case 'osu':
		case 'fruits':
		case 'mania':
		case 'taiko':
			break;
		default:
			return {
				status: 400,
				body: {
					error: 'Invalid gamemode'
				}
			};
	}

	try {
		let user = await Prisma.client.osu.findUnique({
			where: {
				discordId: userId
			},
			include: {
				modes: {
					where: {
						gamemode: gamemode
					}
				}
			}
		});

		if (!user) {
			return {
				status: 404
			};
		}

		const env = Env.load();

		let access_token = user.access_token;
		let refresh_token = user.refresh_token;
		let expires_at = user.expires_at;

		if (!expires_at || expires_at.getTime() < Date.now()) {
			const response = await axios.post<IOsuAccessToken>(
				'https://osu.ppy.sh/oauth/token',
				{
					client_id: parseInt(env['OSU_CLIENT_ID']),
					client_secret: env['OSU_CLIENT_SECRET'],
					refresh_token: refresh_token,
					grant_type: 'refresh_token'
				},
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					}
				}
			);

			access_token = response.data.access_token;
			refresh_token = response.data.refresh_token;
			expires_at = new Date(Date.now() + response.data.expires_in * 1000);

			await Prisma.client.osu.update({
				where: {
					id: user.id.toString()
				},
				data: {
					expires_at: expires_at,
					access_token: access_token,
					refresh_token: refresh_token
				}
			});
		}

		await Prisma.client.osuMode.updateMany({
			where: {
				osuId: user.id.toString()
			},
			data: {
				selected: false
			}
		});

		if (user.modes.length > 0) {
			await Prisma.client.osuMode.update({
				where: {
					osuId_gamemode: {
						osuId: user.id.toString(),
						gamemode: gamemode
					}
				},
				data: {
					selected: true
				}
			});
		}

		if (user.modes.length === 0 || canUpdateOsu(user.modes[0])) {
			const osu = await getOsuUser(access_token ?? '', gamemode);

			await Prisma.client.osu.upsert({
				where: {
					id: user.id.toString()
				},
				update: {
					id: user.id.toString(),
					country: osu.country_code,
					avatar: osu.avatar_url,
					username: osu.username,
					discordId: userId,
					restricted: osu.is_restricted
				},
				create: {
					id: user.id.toString(),
					country: osu.country_code,
					avatar: osu.avatar_url,
					username: osu.username,
					discordId: userId,
					restricted: osu.is_restricted,
					expires_at: expires_at,
					access_token: access_token,
					refresh_token: refresh_token
				}
			});

			await Prisma.client.osuMode.upsert({
				where: {
					osuId_gamemode: {
						osuId: user.id.toString(),
						gamemode: gamemode
					}
				},
				update: {
					osuId: user.id.toString(),
					gamemode: gamemode,
					rank: osu.statistics?.global_rank,
					countryRank: osu.statistics?.rank.country,
					level: osu.statistics?.level?.current,
					pp: osu.statistics?.pp,
					rankedScore: osu.statistics?.ranked_score,
					hitAccuracy: osu.statistics?.hit_accuracy,
					playCount: osu.statistics?.play_count,
					playTime: osu.statistics?.play_time,
					lastRefreshed: new Date(),
					selected: true
				},
				create: {
					osuId: user.id.toString(),
					gamemode: gamemode,
					rank: osu.statistics?.global_rank,
					countryRank: osu.statistics?.rank.country,
					level: osu.statistics?.level?.current,
					pp: osu.statistics?.pp,
					rankedScore: osu.statistics?.ranked_score,
					hitAccuracy: osu.statistics?.hit_accuracy,
					playCount: osu.statistics?.play_count,
					playTime: osu.statistics?.play_time,
					lastRefreshed: new Date(),
					selected: true
				}
			});
		}

		user = await Prisma.client.osu.findUnique({
			where: {
				discordId: userId
			},
			include: {
				modes: {
					where: {
						gamemode: gamemode
					}
				}
			}
		});

		if (user) {
			user.access_token = null;
			user.refresh_token = null;
		}

		return {
			status: 200,
			body: user
		};
	} catch (error) {
		SentryClient.log(error);

		await Prisma.client.osu.delete({
			where: {
				discordId: userId
			}
		});

		return {
			status: 400
		};
	}
};
