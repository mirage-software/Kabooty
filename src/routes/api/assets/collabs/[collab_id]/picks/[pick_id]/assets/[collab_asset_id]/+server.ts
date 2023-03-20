import { json, type RequestHandler } from '@sveltejs/kit';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import { Prisma } from '../../../../../../../../../database/prisma';
import cookie from 'cookie';
import { Jwt } from '../../../../../../../../../jwt';
import { SentryClient } from '../../../../../../../../../bot/sentry';
import imageType from 'image-type';
import sharp from 'sharp';
import { ServerPaths } from '../../../../../../../../../utils/paths/server';
import { DiscordUser } from '../../../../../../../../../utils/discord/user';

export const POST: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	const url = new URL(request.url);

	const width = parseInt(url.searchParams.get('width') ?? '0');
	const height = parseInt(url.searchParams.get('height') ?? '0');
	const x = parseInt(url.searchParams.get('x') ?? '0');
	const y = parseInt(url.searchParams.get('y') ?? '0');

	try {
		if (!token) {
			return new Response(undefined, { status: 401 });
		}

		const user = await DiscordUser.getUser(userId, token);

		if (!user) {
			return new Response(undefined, { status: 403 });
		}

		const collabAssetId = params['collab_asset_id'];
		const pickId = params['pick_id'];

		const collabAsset = await Prisma.client.collabAsset.findUnique({
			where: {
				id: collabAssetId
			},
			include: {
				collab: true
			}
		});

		if (!collabAsset) {
			return json(
				{
					message: 'Collab asset not found'
				},
				{
					status: 404
				}
			);
		}

		if (!collabAsset.collab.allowEditing) {
			return new Response(undefined, { status: 403 });
		}

		let asset = await Prisma.client.asset.findUnique({
			where: {
				pickId_collabAssetId: {
					pickId,
					collabAssetId
				}
			}
		});

		if (asset && asset.userId !== userId) {
			return new Response(undefined, { status: 403 });
		}

		const blob = await request.arrayBuffer();

		const mb = 5120 * 1024;

		if (blob.byteLength > mb) {
			return json(
				{
					message: 'File too large'
				},
				{
					status: 413
				}
			);
		}

		let buffer = Buffer.from(blob);

		const type = imageType(buffer);

		const acceptedExtensions = ['png', 'jpg', 'jpeg', 'webp'];

		if (!type || !acceptedExtensions.includes(type.ext)) {
			return json(
				{
					message: 'Invalid file extension'
				},
				{
					status: 400
				}
			);
		}

		let image = sharp(buffer);
		const metadata = await image.metadata();

		if (
			!metadata ||
			(metadata.width ?? 0) < collabAsset.assetWidth ||
			(metadata.height ?? 0) < collabAsset.assetHeight
		) {
			return json(
				{
					message: 'Image too small'
				},
				{
					status: 400
				}
			);
		}

		if (
			width !== null &&
			width !== undefined &&
			height !== null &&
			height !== undefined &&
			x !== null &&
			x !== undefined &&
			y !== null &&
			y !== undefined
		) {
			image = image.extract({
				width: width ?? metadata.width,
				height: height ?? metadata.height,
				left: x,
				top: y
			});
		}

		image = image.resize(collabAsset.assetWidth, collabAsset.assetHeight);

		if (asset) {
			const originalFile = path.join(
				ServerPaths.asset(asset.collabId, pickId, collabAssetId),
				asset.image
			);

			if (existsSync(originalFile)) {
				unlinkSync(originalFile);
			}
		}

		buffer = await image.png().toBuffer();

		const file =
			ServerPaths.generateAssetName(pickId, collabAssetId, collabAsset.assetType) + '.png';

		const filePath = path.join(
			ServerPaths.asset(collabAsset.collabId, pickId, collabAssetId),
			file
		);

		mkdirSync(path.dirname(filePath), { recursive: true });

		writeFileSync(filePath, buffer);

		if (!asset) {
			asset = await Prisma.client.asset.create({
				data: {
					collabId: collabAsset.collabId,
					pickId,
					collabAssetId,
					image: file,
					userId: userId,
					valid: true
				}
			});
		} else {
			asset = await Prisma.client.asset.update({
				where: {
					id: asset.id
				},
				data: {
					image: file,
					valid: true,
					createdAt: new Date()
				}
			});
		}

		return json(asset);
	} catch (error) {
		SentryClient.log(error);

		return new Response(undefined, { status: 400 });
	}
};
