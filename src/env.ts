import * as process from 'process';
import * as path from 'path';

import dotenv from 'dotenv';

export abstract class Env {
	private static stored: dotenv.DotenvParseOutput | undefined;

	static async load() {
		if (Env.stored) {
			return Env.stored;
		}

		const loaded = dotenv.config({
			path: path.resolve(process.cwd(), '.env')
		});

		if (loaded.error) {
			throw loaded.error;
		}

		Env.stored = loaded.parsed;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return Env.stored!;
	}

	static async extract(env: dotenv.DotenvParseOutput) {
		return Object.fromEntries(Object.entries(env).filter((e) => e[0].startsWith('PUBLIC_')));
	}

	static async public() {
		const env = await Env.load();
		return Env.extract(env);
	}
}
