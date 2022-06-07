import jwt from 'jsonwebtoken';
import { Env } from './env';

export abstract class Jwt {
	static encode(data: string | { [key: string]: unknown } | Buffer): string {
		const env = Env.load();

		const options = {} as {[k: string]: string};
		if(typeof data === "object") {
			options["issuer"] = "Endless Mirage";
		}
		return jwt.sign(data, env['JWT_SECRET'], options);
	}

	static decode(data: string): string | { [key: string]: unknown } | Buffer | null {
		const env = Env.load();

		try {
			const decode = jwt.verify(data, env['JWT_SECRET']);
			if(typeof decode === "object" && decode.iss !== "Endless Mirage") { //Shouldn't happen but who knows
				return null;
			}
			return decode;
		} catch (_) {
			return null;
		}
	}
}
