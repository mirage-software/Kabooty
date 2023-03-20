import { sveltekit } from '@sveltejs/kit/vite';
import precompileIntl from 'svelte-intl-precompile/sveltekit-plugin';
import autoprefixer from 'autoprefixer';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), precompileIntl('static/locales')],
	css: {
		postcss: {
			plugins: [autoprefixer]
		},
		preprocessorOptions: {
			scss: {
				additionalData: '@use "src/variables.scss" as *;'
			}
		}
	}
};

export default config;
