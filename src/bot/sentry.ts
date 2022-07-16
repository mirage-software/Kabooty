import * as Sentry from '@sentry/node';
import { Env } from '../env';

export abstract class SentryClient {
	static _initialized = false;

	static initialized(): boolean {
		if (SentryClient._initialized) {
			return true;
		}

		const env = Env.load();

		if (!env['SENTRY_DSN']) {
			return false;
		}

		Sentry.init({
			dsn: env['SENTRY_DSN'],
			tracesSampleRate: 1.0
		});

		SentryClient._initialized = true;

		return true;
	}

	static log(e: unknown, data: { [key: string]: unknown } | null | undefined = undefined): void {
		if (!SentryClient.initialized()) {
			return;
		}

		Sentry.captureException(e, {
			contexts: {
				data: data ?? {}
			}
		});
	}
}
