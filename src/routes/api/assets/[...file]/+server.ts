import type { RequestHandler } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import path from 'path';
import { Env } from '../../../../env';
import * as mime from 'mime-types';
import sharp from 'sharp';

export const GET: RequestHandler = async ({ params, request }) => {
	const env = Env.load();

	const filePath = path.join(env['FILE_STORAGE_PATH'], params.file);

	const fileName = path.basename(filePath);

	const url = new URL(request.url);

	let width: number | undefined;
	let height: number | undefined;

	if (url.searchParams.get('width') !== null) {
		width = parseInt(url.searchParams.get('width') ?? '-1');
	}

	if (url.searchParams.get('height') !== null) {
		height = parseInt(url.searchParams.get('height') ?? '-1');
	}

	try {
		let file = readFileSync(filePath);

		const contentType = mime.contentType(fileName) || 'application/octet-stream';

		if (width && height) {
			const image = sharp(file);
			file = await image.resize(width, height).toBuffer();
		}

		return new Response(file, {
			headers: {
				'Content-Type': contentType,
				'cache-control': 'public, max-age=172800'
			}
		});
	} catch (error) {
		return new Response(undefined, { status: 404 });
	}
};
