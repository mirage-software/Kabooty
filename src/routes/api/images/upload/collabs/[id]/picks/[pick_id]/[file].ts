import type { RequestHandler } from '@sveltejs/kit';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import { Prisma } from '../../../../../../../../database/prisma';
import { Env } from '../../../../../../../../env';
import cookie from 'cookie';
import { Jwt } from '../../../../../../../../jwt';
import { getUser } from '../../../../../../discord/user';
import { SentryClient } from '../../../../../../../../bot/sentry';
import imageType from 'image-type';
import sharp from 'sharp';

export const post: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	try {
		if (!token) {
			return {
				status: 401
			};
		}

		const user = await getUser(token, userId);

		if (!user) {
			return {
				status: 403
			};
		}

		const collabId = params.id;
		const pickId = params['pick_id'];

		const env = Env.load();

		const collab = await Prisma.client.collab.findUnique({
			where: {
				id: collabId
			}
		});

		if (!collab) {
			return {
				status: 404,
				body: {
					message: 'Collab not found'
				}
			};
		}

		const pick = await Prisma.client.pick.findUnique({
			where: {
				id: pickId
			}
		});

		if (!pick) {
			return {
				status: 404,
				body: {
					message: 'Pick not found'
				}
			};
		}

		if (pick.userId !== userId) {
			return {
				status: 403
			};
		}

		if (pick.image) {
			const originalFile = path.join(
				env['FILE_STORAGE_PATH'],
				'collabs',
				collab.id,
				'picks',
				pick.image
			);

			if (existsSync(originalFile)) {
				unlinkSync(originalFile);
			}
		}

		const blob = await request.arrayBuffer();

		const mb = 5120 * 1024;

		if (blob.byteLength > mb) {
			return {
				status: 413,
				body: {
					message: 'File too large'
				}
			};
		}

		let buffer = Buffer.from(blob);

		const type = imageType(buffer);

		const acceptedExtensions = ['png', 'jpg', 'jpeg', 'webp'];

		if (!type || !acceptedExtensions.includes(type.ext)) {
			return {
				status: 400,
				body: {
					message: 'Invalid file extension'
				}
			};
		}

		const image = sharp(buffer);
		const metadata = await image.metadata();

		if (!metadata || (metadata.width ?? 0) < 900 || (metadata.height ?? 0) < 900) {
			return {
				status: 400,
				body: {
					message: 'Image too small'
				}
			};
		}

		if (type.ext !== 'png') {
			buffer = await image.png().toBuffer();
		}

		const file = params['pick_id'] + '.png';

		const filePath = path.join(env['FILE_STORAGE_PATH'], 'collabs', collab.id, 'picks', file);

		mkdirSync(path.dirname(filePath), { recursive: true });

		writeFileSync(filePath, buffer);

		pick.image = file;

		await Prisma.client.pick.update({
			where: {
				id: pickId
			},
			data: {
				image: file
			}
		});

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};
