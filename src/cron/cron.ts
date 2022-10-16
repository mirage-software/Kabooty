import { Assets } from './assets';
import { Bumps } from './bumps';

export abstract class Cron {
	static initialized = false;

	static start() {
		if (!Cron.initialized) {
			Cron.initialized = true;

			Assets.start();
			Bumps.start();
		}
	}
}
