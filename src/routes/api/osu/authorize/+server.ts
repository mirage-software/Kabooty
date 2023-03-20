import { json, type RequestHandler } from '@sveltejs/kit';
import { Env } from '../../../../env';

export interface IOsuAuthUrl extends Record<string, string> {
	url: string;
}

export const GET: RequestHandler = async () => {
	const env = Env.load();

	return json(<IOsuAuthUrl>{
		url: `https://osu.ppy.sh/oauth/authorize?response_type=code&client_id=${env['OSU_CLIENT_ID']}&redirect_uri=${env['OSU_REDIRECT_URI']}&scope=public`
	});
};
