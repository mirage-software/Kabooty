import { writable } from 'svelte/store';
import { bind } from 'svelte-simple-modal';

function createModalStore() {
	const modalStore = writable(null);

	return {
		subscribe: modalStore.subscribe,
		open: (component: unknown, props: Record<string, unknown>) => {
			modalStore.set(bind(component, props));
		},
		close: () => {
			modalStore.set(null);
		}
	};
}

export const modal = createModalStore();
