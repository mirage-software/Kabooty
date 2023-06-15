import type { RequestHandler } from '@sveltejs/kit';

import cookie from 'cookie';
import path from 'path';
import type { CollabAsset } from '@prisma/client';
import { SentryClient } from '../../../../../../bot/sentry';
import { Jwt } from '../../../../../../jwt';
import { ServerPaths } from '../../../../../../utils/paths/server';
import { Prisma } from '../../../../../../database/prisma';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import imageType from 'image-type';
import sharp from 'sharp';
import { DiscordUser } from '../../../../../../utils/discord/user';

export async function deleteExample(collabAsset: CollabAsset) {
	if (existsSync(ServerPaths.collabAsset(collabAsset.collabId, collabAsset.id))) {
		unlinkSync(ServerPaths.collabAsset(collabAsset.collabId, collabAsset.id));
	}
}

export const post: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	const url = new URL(request.url);

	const x = parseInt(url.searchParams.get('x') ?? '0');
	const y = parseInt(url.searchParams.get('y') ?? '0');

	try {
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

		const collabAssetId = params['collab_asset_id'];

		let collabAsset = await Prisma.client.collabAsset.findUnique({
			where: {
				id: collabAssetId
			}
		});

		if (!collabAsset) {
			return {
				status: 404,
				body: {
					message: 'Collab asset not found'
				}
			};
		}

		if (collabAsset.example) {
			await deleteExample(collabAsset);
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

		const acceptedExtensions = ['png'];

		if (!type || !acceptedExtensions.includes(type.ext)) {
			return {
				status: 400,
				body: {
					message: 'Invalid file extension'
				}
			};
		}

		let image = sharp(buffer);

		image = image.extract({
			width: collabAsset.assetWidth,
			height: collabAsset.assetHeight,
			left: x,
			top: y
		});

		buffer = await image.png().toBuffer();

		const file = ServerPaths.collabAsset(collabAsset.collabId, collabAsset.id);

		mkdirSync(path.dirname(file), { recursive: true });

		writeFileSync(file, buffer);

		collabAsset = await Prisma.client.collabAsset.update({
			where: {
				id: collabAsset.id
			},
			data: {
				example: true,
				exampleX: x,
				exampleY: y
			}
		});

		return {
			status: 200,
			body: collabAsset
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};

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
		const user = await DiscordUser.getUser(userId, token);

		if (!user || !user.admin) {
			return {
				status: 403
			};
		}

		const collabAssetId = params['collab_asset_id'];

		const asset = await Prisma.client.collabAsset.findUnique({
			where: {
				id: collabAssetId
			}
		});

		if (!asset) {
			return {
				status: 404
			};
		}

		await deleteExample(asset);

		return {
			status: 200,
			body: await Prisma.client.collabAsset.update({
				where: {
					id: collabAssetId
				},
				data: {
					example: false,
					exampleX: null,
					exampleY: null
				}
			})
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 500
		};
	}
};
