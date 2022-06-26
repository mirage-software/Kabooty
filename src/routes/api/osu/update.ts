import type { OsuMode } from '@prisma/client';

export function canUpdateOsu(osu: OsuMode): boolean {
	if (osu && osu.lastRefreshed) {
		const date = new Date(osu.lastRefreshed);
		date.setDate(date.getDate() + 2);

		if (date > new Date()) {
			return false;
		}
	}

	return true;
}
