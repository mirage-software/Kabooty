import type { RequestHandler } from '@sveltejs/kit';
import axios from 'axios';
import { Prisma } from '../../../database/prisma';
import cookie from 'cookie';
import { Jwt } from '../../../jwt';
import type { OsuGameMode } from './types';



export async function getApiUser(access_token: string, mode: OsuGameMode) {
    const request = await axios.get(`https://osu.ppy.sh/api/v2/me/${mode}`, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${access_token}`
        },
    });
    return request.data;
}

export const get: RequestHandler = async ({ request }) => {
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

        const user = await Prisma.client.osuUser.findFirst({
            where: {
                discordId: user_id
            }
        });

        return {
            body: JSON.stringify(user),
            status: 200
        }
    } catch(_) {
        return {
            status: 500
        }
    }
}