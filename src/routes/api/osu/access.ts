import type { RequestHandler } from '@sveltejs/kit';
import { Env } from '../../../env';
import cookie from 'cookie';
import axios from 'axios';
import { getApiUser } from "./user";
import { Prisma } from '../../../database/prisma';
import { Jwt } from '../../../jwt';
import type { IOsuUser } from './types';

export interface IOsuAccessToken extends Record<string, string | number> {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
}

export const get: RequestHandler = async ({ request }) => {
	const env = Env.load();

    try {
        let user_id;
        if (request.headers.has('cookie')) {
            const cookieHeader = request.headers.get('cookie');
    
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const cookies = cookie.parse(cookieHeader!);
    
            const decoded = Jwt.decode(cookies['user_id'])
        
            if(!decoded || typeof decoded !== "object" || Buffer.isBuffer(decoded) || !decoded.hasOwnProperty("user_id") || typeof decoded["user_id"] !== "string") {
                return {
                    status: 401
                };
            }
            user_id = decoded["user_id"];
        }

        const auth = request.headers.get('Authorization');

        if (!auth || auth.length === 0 || !auth.includes("|")) {
            return {
                status: 400,
                body: {
                    error: 'no_code'
                }
            };
        }
        
        const [code, jwtoken] = auth.split("|");

        const t = Jwt.decode(jwtoken);
        if(!t || typeof t !== "object" || Buffer.isBuffer(t) || !t.hasOwnProperty("sd") || typeof t.sd !== "string" || Date.now() - (Number(t.sd)+59148)/3 > 3600000) {
            return {
                status: 400,
                body: {
                    error: "invalid_code"
                }
            };
        }

        const response = await axios.post("https://osu.ppy.sh/oauth/token", {
            client_id: Number(env['OSU_CLIENT_ID']),
            client_secret: env['OSU_CLIENT_SECRET'],
            code: code,
            grant_type: "authorization_code",
            redirect_uri: env['OSU_REDIRECT_URI'],
        }, {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        });

        const data = response.data as IOsuAccessToken;

        const user = (await getApiUser(data.access_token, "osu")) as IOsuUser;

        await Prisma.client.osuUser.upsert({
            where: {
                id: user.id.toString()
            },
            update: {
                id: user.id.toString(),
                country: user.country_code,
                rank: user.statistics?.global_rank,
                countryRank: user.statistics?.rank.country,
                //@ts-ignore
                gamemode: user.playmode,
                username: user.username,
                user: {
                    connect: {
                        discordId: user_id
                    }
                },
            },
            create: {
                id: user.id.toString(),
                country: user.country_code,
                rank: user.statistics?.global_rank || 0,
                countryRank: user.statistics?.rank.country || 0,
                //@ts-ignore
                gamemode: user.playmode,
                username: user.username,
                user: {
                    connect: {
                        discordId: user_id
                    }
                },
            }
        });

        return {
            status: 200,
        }
    } catch(error) {
        return {
            status: 400,
			body: {
				error: "authentication_failed"
			}
        }
    }
};
