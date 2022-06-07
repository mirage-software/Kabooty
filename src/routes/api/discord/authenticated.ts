import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../jwt';

export interface IDiscordAccessToken extends Record<string, string | number> {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
}

export const get: RequestHandler = async ({ request }) => {
	let token;

	if (request.headers.has('cookie')) {
		const cookieHeader = request.headers.get('cookie');

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const cookies = cookie.parse(cookieHeader!);

		const encoded = cookies['discord_token'];
		token = Jwt.decode(encoded)?.access_token;
	}

	if (!token) {
		return {
			body: {
				authenticated: false
			}
		};
	} else {
		return {
			body: {
				authenticated: true
			}
		};
	}
};
