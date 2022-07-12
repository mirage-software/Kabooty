import type { RequestHandler } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import path from 'path';
import { Env } from '../../../env';
import * as mime from 'mime-types';

export const get: RequestHandler = async ({ params }) => {
	const env = Env.load();

	const filePath = path.join(env['FILE_STORAGE_PATH'], params.file);

	const fileName = path.basename(filePath);

	try {
		const file = readFileSync(filePath);

		const contentType = mime.contentType(fileName) || 'application/octet-stream';

		return {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'cache-control': 'public, max-age=172800'
			},
			body: file
		};
	} catch (error) {
		return {
			status: 404
		};
	}
};
