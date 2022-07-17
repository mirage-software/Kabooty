import type { Pick } from '@prisma/client';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { Prisma } from '../../../../../database/prisma';
import { Env } from '../../../../../env';

export async function deletePick(pick: Pick): Promise<void> {
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

	await Prisma.client.pick.delete({
		where: {
			id: pick.id
		}
	});
}
