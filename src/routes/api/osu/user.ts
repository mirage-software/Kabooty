import type { RequestHandler } from '@sveltejs/kit';
import axios from 'axios';

export type OsuGameMode = 'osu' | 'taiko' | 'fruits' | 'mania';

export type IOsuUserCompact = {
    avatar_url: string;
    country_code: string;
    default_group: string;
    id: number;
    is_active: boolean;
    is_bot: boolean;
    is_deleted: boolean;
    is_online: boolean;
    is_supporter: boolean;
    last_visit: Date | null;
    pm_friends_only: boolean;
    profile_colour?: string
    username: string;
}

export type IOsuUser = IOsuUserCompact & {}

export async function getMe(access_token: string, mode: OsuGameMode) {
    const request = await axios.get(`https://osu.ppy.sh/api/v2/me?mode=${mode}`);
    return request.data;
}

export const get: RequestHandler = async ({ request }) => {
    return {
        status: 500
    }
}