export abstract class Formatting {
	static toKebabCase(str: string | null | undefined) {
		if (!str) {
			return null;
		}

		const match = str.match(/[a-z0-9]+/gi);

		if (!match) {
			return null;
		}

		return match.map((x) => x.toLowerCase()).join('-');
	}
}
