import type { AnimeCharacter } from '@prisma/client';
import { writable } from 'svelte/store';

function createSelectedStore() {
	const selectedStore = writable<AnimeCharacter | undefined | null>(undefined);

	return {
		subscribe: selectedStore.subscribe,
		update: (character: AnimeCharacter | null) => {
			selectedStore.set(character);
		}
	};
}

export const selected = createSelectedStore();
