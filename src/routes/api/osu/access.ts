import type { RequestHandler } from '@sveltejs/kit';
import { Env } from '../../../env';
import cookie from 'cookie';
import axios from 'axios';
import { Prisma } from '../../../database/prisma';
import { Jwt } from '../../../jwt';

export interface IOsuAccessToken extends Record<string, string | number> {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
}

async function getOsuUser(access_token: string) {
	const request = await axios.get(`https://osu.ppy.sh/api/v2/me/osu`, {
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${access_token}`
		}
	});
	return request.data;
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

		const user = await getOsuUser(data.access_token);

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
				restricted: user.is_restricted
			},
			create: {
				id: user.id.toString(),
				country: user.country_code,
				avatar: user.avatar_url,
				username: user.username,
				discordId: userId,
				restricted: user.is_restricted
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
		return {
			status: 500,
			body: {
				error: 'authentication_failed'
			}
		};
	}
};
