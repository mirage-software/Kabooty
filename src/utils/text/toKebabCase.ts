export function toKebabCase(str: string | null | undefined) {
	if (str === null || str === undefined) {
		return '';
	}

	const match = str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g);

	if (match === null || match === undefined) {
		return '';
	}

	return match.map((x) => x.toLowerCase()).join('-');
}
