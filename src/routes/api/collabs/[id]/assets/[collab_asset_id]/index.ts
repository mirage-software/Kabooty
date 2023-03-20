import type { RequestHandler } from '@sveltejs/kit';

import cookie from 'cookie';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import type { Asset, CollabAsset } from '@prisma/client';
import { SentryClient } from '../../../../../../bot/sentry';
import { Jwt } from '../../../../../../jwt';
import { ServerPaths } from '../../../../../../utils/paths/server';
import { Prisma } from '../../../../../../database/prisma';
import { deleteExample } from './example';
import { DiscordUser } from '../../../../../../utils/discord/user';

export const PUT: RequestHandler = async ({ request, params }) => {
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

		const body: CollabAsset = await request.json();

		if (
			!body.assetHeight ||
			!body.assetWidth ||
			!body.assetName ||
			body.mainAsset === undefined ||
			body.mainAsset === null ||
			!body.assetType
		) {
			return {
				status: 400
			};
		}

		const collabAssetId = params['collab_asset_id'];

		const asset = await Prisma.client.collabAsset.update({
			where: {
				id: collabAssetId
			},
			data: {
				assetHeight: body.assetHeight,
				assetWidth: body.assetWidth,
				assetName: body.assetName,
				mainAsset: body.mainAsset
			}
		});

		if (!asset) {
			return {
				status: 404
			};
		}

		const collabId = params.id;

		if (body.mainAsset) {
			await Prisma.client.collabAsset.updateMany({
				where: {
					AND: [
						{
							collabId: collabId
						},
						{
							NOT: {
								id: collabAssetId
							}
						}
					]
				},
				data: {
					mainAsset: false
				}
			});
		}

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 500
		};
	}
};

export async function deleteImages(collabAssetId: string): Promise<void> {
	let page = 0;

	let assets: Asset[] | null = null;

	while (!assets || assets.length > 0) {
		assets = await Prisma.client.asset.findMany({
			where: {
				collabAssetId: collabAssetId
			},
			take: 100,
			skip: page * 100
		});

		for (const asset of assets) {
			// TODO: perhaps a different folder structure would be better in the future, for performance reasons
			// for example, we could simply delete the folder and all of its contents
			const filePath = path.join(
				ServerPaths.asset(asset.collabId, asset.pickId, asset.collabAssetId),
				asset.image
			);
			if (existsSync(filePath)) {
				unlinkSync(filePath);
			}
		}

		page++;
	}
}

export const DELETE: RequestHandler = async ({ request, params }) => {
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

		await Prisma.client.log.create({
			data: {
				action: 'admin_delete_collab_asset',
				userId: userId,
				data: JSON.stringify(asset)
			}
		});

		await deleteImages(collabAssetId);
		await deleteExample(asset);

		await Prisma.client.collabAsset.delete({
			where: {
				id: collabAssetId
			}
		});

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 500
		};
	}
};
