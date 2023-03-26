import { writable } from 'svelte/store';

export const clientHeight = writable<number | undefined>(undefined);
