import type { RequestHandler } from '@sveltejs/kit';

import cookie from 'cookie';
import { CollabStatus, type Pick } from '@prisma/client';
import { Jwt } from '../../../../../../jwt';
import { getUser } from '../../../../discord/user';
import { Prisma } from '../../../../../../database/prisma';
import { Env } from '../../../../../../env';
import { SentryClient } from '../../../../../../bot/sentry';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';

export async function deleteImage(pick: Pick): Promise<void> {
	if (!pick) {
		throw new Error('Pick not found');
	}

	const env = Env.load();

	if (pick.image) {
		const filePath = path.join(
			env['FILE_STORAGE_PATH'],
			'collabs',
			pick.collabId,
			'picks',
			pick.image
		);

		if (existsSync(filePath)) {
			unlinkSync(filePath);
		}
	}

	await Prisma.client.pick.update({
		where: {
			id: pick.id
		},
		data: { image: null }
	});
}

export const del: RequestHandler = async ({ request, params }) => {
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

	try {
		const user = await getUser(token, userId);

		if (!user) {
			return {
				status: 403
			};
		}

		const pickId = params['pick_id'];

		const pick = await Prisma.client.pick.findUnique({
			where: {
				id: pickId
			},
			include: {
				collab: true
			}
		});

		if (!pick) {
			return {
				status: 404
			};
		}

		if (pick.userId !== user.id) {
			if (user.admin) {
				await Prisma.client.log.create({
					data: {
						action: 'admin_delete_pick_image',
						userId: user.id,
						data: JSON.stringify(pick)
					}
				});

				await deleteImage(pick);

				return {
					status: 200
				};
			} else {
				return {
					status: 403
				};
			}
		} else {
			if (
				pick.collab.status === CollabStatus.BUMP ||
				pick.collab.status === CollabStatus.OPEN ||
				pick.collab.status === CollabStatus.EARLY_ACCESS
			) {
				await deleteImage(pick);

				return {
					status: 200
				};
			} else {
				return {
					status: 403
				};
			}
		}
	} catch (error) {
		console.log(error);
		SentryClient.log(error);

		return {
			status: 500
		};
	}
};
