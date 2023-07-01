import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../database/prisma';
import cookie from 'cookie';
import { Jwt } from '../../../../jwt';
import { DiscordUser } from '../../../../utils/discord/user';

export const post: RequestHandler = async ({ request }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	if (!token) {
		return {
			status: 401
		};
	}

	const user = await DiscordUser.getUser(userId, token);

	if (!user || !user.admin) {
		return {
			status: 403
		};
	}

	const character = await request.json();

	console.log(character);

	if (
		character.anime_name === undefined ||
		character.anime_name.trim() === '' ||
		character.name === undefined ||
		character.name.trim() === ''
	) {
		return {
			status: 401
		};
	}

	const updateCharacter = await Prisma.client.animeCharacter.update({
		where: { id: character.id },
		data: {
			anime_name: character.anime_name,
			name: character.name
		}
	});

	const updatePicks = await Prisma.client.pick.updateMany({
		where: {
			characterId: character.id
		},
		data: {
			name: character.name
		}
	});

	return {
		status: 200
	};
};
