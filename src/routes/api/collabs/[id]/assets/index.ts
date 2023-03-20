import type { RequestHandler } from '@sveltejs/kit';

import cookie from 'cookie';
import type { CollabAsset } from '@prisma/client';
import { SentryClient } from '../../../../../bot/sentry';
import { Jwt } from '../../../../../jwt';
import { Prisma } from '../../../../../database/prisma';
import { DiscordUser } from '../../../../../utils/discord/user';

export const POST: RequestHandler = async ({ request, params }) => {
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

		const collabId = params.id;

		const asset = await Prisma.client.collabAsset.create({
			data: {
				collabId: collabId,
				assetHeight: body.assetHeight,
				assetWidth: body.assetWidth,
				assetName: body.assetName,
				mainAsset: body.mainAsset,
				assetType: body.assetType
			}
		});

		if (body.mainAsset) {
			await Prisma.client.collabAsset.updateMany({
				where: {
					AND: [
						{
							collabId: collabId
						},
						{
							NOT: {
								id: asset.id
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
