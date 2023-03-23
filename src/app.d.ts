/// <reference types="@sveltejs/kit" />

import type { User } from '@prisma/client';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			signedIn: boolean | undefined;
			// TODO: add roles and permissions to this type
			user: User | undefined | null;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
