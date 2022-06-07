import type { RequestHandler } from '@sveltejs/kit';
import jsonwebtoken from "jsonwebtoken";
import cookie from 'cookie';
import { Env } from '../../../env';
import { getUser } from "../discord/user";

export interface IOsuAuthUrl extends Record<string, string> {
	url: string;
}

export const get: RequestHandler = async () => {
    const env = Env.load();

    const token = jsonwebtoken.sign({
        sd: (Date.now()*3-59148).toString()
    }, env["JWT_SECRET"], {
        "issuer": "Endless Mirage",
        "expiresIn": 3600
    })

	return {
		body: <IOsuAuthUrl>{
			url: `https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${env["OSU_CLIENT_ID"]}&redirect_uri=${env["OSU_REDIRECT_URI"]}&state=${token}&scope=identify`
		}
	};
};
