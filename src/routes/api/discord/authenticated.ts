import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';

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

		token = cookies['discord_token'];
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
