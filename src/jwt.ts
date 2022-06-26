import jwt from 'jsonwebtoken';
import { Env } from './env';

export abstract class Jwt {
	static encode(data: { [key: string]: unknown }): string {
		const env = Env.load();

		return jwt.sign(data, env['JWT_SECRET'], {
			issuer: 'Endless Mirage'
		});
	}

	static decode(data: string): { [key: string]: unknown } {
		const env = Env.load();

		try {
			const decode = jwt.verify(data, env['JWT_SECRET']);
			return decode as { [key: string]: unknown };
		} catch (_) {
			return {};
		}
	}
}
