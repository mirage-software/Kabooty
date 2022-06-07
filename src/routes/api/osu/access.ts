import type { RequestHandler } from '@sveltejs/kit';
import { Env } from '../../../env';
import cookie from 'cookie';
import axios from 'axios';
import { getMe, type IOsuUser } from "./user";
import { Prisma } from '../../../database/prisma';
import { Jwt } from '../../../jwt';

export interface IOsuAccessToken extends Record<string, string | number> {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
}

export const get: RequestHandler = async ({ request }) => {
    let user_id;
    //TODO: no Cookie header here
	if (request.headers.has('cookie')) {
		const cookieHeader = request.headers.get('cookie');

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const cookies = cookie.parse(cookieHeader!);

        if(cookies['user_id']) {
            return {
				status: 400
			};
        }

        const decoded = Jwt.decode(cookies['user_id'])

        if(decoded && typeof decoded === "string" && !Buffer.isBuffer(decoded)) {
			user_id = decoded;
		} else {
            return {
                status: 400
            };
        }
	} else {
        return {
            status: 400
        };
    }

	const env = Env.load();

    try {
        const auth = request.headers.get('Authorization');

        if (!auth || auth.length === 0 || !auth.includes("|")) {
            return {
                status: 400,
                body: {
                    error: 'Missing osu! code'
                }
            };
        }
        
        const [code, jwtoken] = auth.split("|");

        const t = Jwt.decode(jwtoken);
        if(!t || typeof t !== "object" || Buffer.isBuffer(t) || !t.hasOwnProperty("sd") || typeof t.sd !== "string" || Date.now() - (Number(t.sd)+59148)/3 > 3600000) {
            return {
                status: 400,
                body: {
                    error: 'Failed to verify osu! code'
                }
            };
        }

        const response = await axios.post("https://osu.ppy.sh/oauth/token", {
            grant_type: "authorization_code",
            code: code,
            client_id: Number(env['OSU_CLIENT_ID']),
            client_secret: env['OSU_CLIENT_SECRET'],
            redirect_uri: env['OSU_REDIRECT_URI'],
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        });

        const data = JSON.parse(response.data) as IOsuAccessToken;

        const user = (await getMe(data.access_token, "osu")) as IOsuUser;

        await Prisma.client.osu.upsert({
            where: {
                id: user.id.toString()
            },
            update: {
                id: user.id.toString(),
                user: {
                    connect: {
                        discordId: user_id
                    }
                },
            },
            create: {
                id: user.id.toString(),
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
				error: 'Failed to authenticate with osu!'
			}
        }
    }
};
