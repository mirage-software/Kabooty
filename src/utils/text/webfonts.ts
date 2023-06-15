export abstract class WebFonts {
	static status: { [key: string]: 'loading' | 'loaded' } = {};
	static onLoad: { [key: string]: [() => void] } = {};

	static active(font: string) {
		return Object.keys(WebFonts.status).includes(font) && WebFonts.status[font] === 'loaded';
	}

	static loading(font: string) {
		return Object.keys(WebFonts.status).includes(font) && WebFonts.status[font] === 'loading';
	}

	static async load(
		data: {
			font: string | undefined;
			weight: number | undefined;
			italic: boolean | undefined;
			size: number | undefined;
		},
		active: () => void
	) {
		const WebFont = await import('webfontloader');
		const fontWeight = data.weight?.toString() ?? '400';
		const fontFamily = data.font ?? 'Times New Roman';

		const wfFont = fontFamily.toLowerCase().replace(/[^a-z0-9]/gi, '');
		const wfFvd = (data.italic ? 'i' : 'n') + fontWeight[0];
		const wfClass = `wf-${wfFont}-${wfFvd}`;

		if (WebFonts.active(wfClass)) {
			active();
		}

		if (!Object.keys(WebFonts.onLoad).includes(wfClass)) {
			WebFonts.onLoad[wfClass] = [active];
		} else {
			WebFonts.onLoad[wfClass].push(active);
		}

		if (!WebFonts.loading(wfClass) && !WebFonts.active(wfClass)) {
			WebFont.load({
				google: {
					families: [fontFamily + ':' + (data.italic ? fontWeight + 'italic' : fontWeight)]
				},
				active: function () {
					WebFonts.onLoad[wfClass].forEach((callback) => {
						callback();
					});
				}
			});
		}
	}
}
