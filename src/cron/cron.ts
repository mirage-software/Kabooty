import { Assets } from './assets';
import { Bumps } from './bumps';
import { Si } from './si';

export abstract class Cron {
	static initialized = false;

	static start() {
		if (!Cron.initialized) {
			Cron.initialized = true;

			Assets.start();
			Bumps.start();
			Si.start();
		}
	}
}
