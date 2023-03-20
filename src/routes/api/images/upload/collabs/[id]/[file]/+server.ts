import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import { Prisma } from '../../../../../../../database/prisma';
import { Env } from '../../../../../../../env';
import cookie from 'cookie';
import { Jwt } from '../../../../../../../jwt';
import imageType from 'image-type';
import sharp from 'sharp';
import { DiscordUser } from '../../../../../../../utils/discord/user';

// TODO: move the collab images to the new asset system

export const POST: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	if (!token) {
		return new Response(undefined, { status: 401 });
	}

	const user = await DiscordUser.getUser(userId, token);

	if (!user || !user.admin) {
		return new Response(undefined, { status: 403 });
	}

	const env = Env.load();

	const collab = await Prisma.client.collab.findUnique({
		where: {
			id: params.id
		}
	});

	if (!collab) {
		return json({
			message: 'Collab not found'
		}, {
			status: 404
		});
	}

	if (collab.logo) {
		const originalFile = path.join(env['FILE_STORAGE_PATH'], 'collabs', collab.logo);

		if (existsSync(originalFile)) {
			unlinkSync(originalFile);
		}
	}

	const blob = await request.arrayBuffer();

	const mb = 1024 * 1024;

	if (blob.byteLength > mb) {
		return json({
			message: 'File too large'
		}, {
			status: 413
		});
	}

	let buffer = Buffer.from(blob);

	const type = imageType(buffer);

	const acceptedExtensions = ['png', 'jpg', 'jpeg', 'webp'];

	if (!type || !acceptedExtensions.includes(type.ext)) {
		return json({
			message: 'Invalid file extension'
		}, {
			status: 400
		});
	}

	if (type.ext !== 'png') {
		const image = sharp(buffer);
		buffer = await image.png().toBuffer();
	}

	const file = params.id + '.png';

	const filePath = path.join(env['FILE_STORAGE_PATH'], 'collabs', file);

	mkdirSync(path.dirname(filePath), { recursive: true });

	writeFileSync(filePath, buffer);

	await Prisma.client.collab.update({
		where: {
			id: params.id
		},
		data: {
			logo: file
		}
	});

	return new Response(undefined);
};
