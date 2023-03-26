import { CollabStatus } from '@prisma/client';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	const collabStatuses = Object.keys(CollabStatus);
	return {
		collabStatuses: collabStatuses
	};
};
