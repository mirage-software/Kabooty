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

export async function getOsuUser(access_token: string, gamemode: string) {
	const request = await axios.get(`https://osu.ppy.sh/api/v2/me/${gamemode}`, {
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${access_token}`
		}
	});

	// !! maybe this helps with special characters?
	const user = JSON.stringify(request.data);
	return JSON.parse(user);
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

		const user = await getOsuUser(data.access_token, 'osu');

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
				refresh_token: data.refresh_token
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
				refresh_token: data.refresh_token
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
		console.error(error);

		return {
			status: 500,
			body: {
				error: 'authentication_failed'
			}
		};
	}
};
