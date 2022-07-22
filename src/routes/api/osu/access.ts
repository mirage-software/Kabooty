import type { RequestHandler } from '@sveltejs/kit';
import { Env } from '../../../env';
import cookie from 'cookie';
import axios from 'axios';
import { Prisma } from '../../../database/prisma';
import { Jwt } from '../../../jwt';
import { SentryClient } from '../../../bot/sentry';

export interface IOsuAccessToken extends Record<string, string | number> {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
}

export async function getUpdatedOsuUser(userId: string) {
	const user = await Prisma.client.osu.findUnique({
		where: {
			discordId: userId
		}
	});

	if (!user) {
		throw new Error('User not found');
	}

	const env = Env.load();

	let access_token = user.access_token;
	let refresh_token = user.refresh_token;
	let expires_at = user.expires_at;

	if (!access_token || !refresh_token || !expires_at) {
		throw new Error('User has no access token');
	}

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

	const osu = await getOsuUser(access_token, null);

	return await Prisma.client.osu.update({
		where: {
			id: user.id.toString()
		},
		data: {
			id: user.id.toString(),
			country: osu.country_code,
			avatar: osu.avatar_url,
			username: osu.username,
			discordId: userId,
			restricted: osu.is_restricted,
			creation_date: osu.join_date
		}
	});
}

export async function getOsuUser(access_token: string, gamemode: string | undefined | null) {
	let url = `https://osu.ppy.sh/api/v2/me/`;

	if (gamemode) {
		url += `${gamemode}`;
	}

	const request = await axios.get(url, {
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${access_token}`
		}
	});

	const user = request.data;

	if (user?.statistics) {
		if (user.statistics.ranked_score !== undefined && user.statistics.ranked_score !== null) {
			user.statistics.ranked_score = user.statistics.ranked_score.toString();
		}
	}

	return user;
}

export const get: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['user_id']);
	const userId = decoded['user_id'] as string;

	const code = request.headers.get('Authorization');

	if (!userId || !code || code.length === 0) {
		return {
			status: 401
		};
	}

	const env = Env.load();

	try {
		const response = await axios.post(
			'https://osu.ppy.sh/oauth/token',
			{
				client_id: parseInt(env['OSU_CLIENT_ID']),
				client_secret: env['OSU_CLIENT_SECRET'],
				code: code,
				grant_type: 'authorization_code',
				redirect_uri: env['OSU_REDIRECT_URI']
			},
			{
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				}
			}
		);

		const data = response.data as IOsuAccessToken;

		const expiresAt = new Date(Date.now() + data.expires_in * 1000);

		const user = await getOsuUser(data.access_token, null);

		await Prisma.client.osu.upsert({
			where: {
				id: user.id.toString()
			},
			update: {
				id: user.id.toString(),
				country: user.country_code,
				avatar: user.avatar_url,
				username: user.username,
				discordId: userId,
				restricted: user.is_restricted,
				expires_at: expiresAt,
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				creation_date: user.join_date
			},
			create: {
				id: user.id.toString(),
				country: user.country_code,
				avatar: user.avatar_url,
				username: user.username,
				discordId: userId,
				restricted: user.is_restricted,
				expires_at: expiresAt,
				access_token: data.access_token,
				refresh_token: data.refresh_token,
				creation_date: user.join_date
			}
		});

		await Prisma.client.osuMode.upsert({
			where: {
				osuId_gamemode: {
					osuId: user.id.toString(),
					gamemode: user.playmode
				}
			},
			update: {
				osuId: user.id.toString(),
				gamemode: user.playmode,
				rank: user.statistics?.global_rank,
				countryRank: user.statistics?.rank.country,
				level: user.statistics?.level?.current,
				pp: user.statistics?.pp,
				rankedScore: user.statistics?.ranked_score,
				hitAccuracy: user.statistics?.hit_accuracy,
				playCount: user.statistics?.play_count,
				playTime: user.statistics?.play_time,
				selected: true
			},
			create: {
				osuId: user.id.toString(),
				gamemode: user.playmode,
				rank: user.statistics?.global_rank,
				countryRank: user.statistics?.rank.country,
				level: user.statistics?.level?.current,
				pp: user.statistics?.pp,
				rankedScore: user.statistics?.ranked_score,
				hitAccuracy: user.statistics?.hit_accuracy,
				playCount: user.statistics?.play_count,
				playTime: user.statistics?.play_time,
				selected: true
			}
		});

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 500,
			body: {
				error: 'authentication_failed'
			}
		};
	}
};
