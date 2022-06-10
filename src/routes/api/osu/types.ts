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

    //optionals
    account_history?: IUserAccountHistory[]
    active_tournament_banner?: IProfileBanner
    badges?: IUserBadge[]
    beatmap_playcounts_count?: number
    groups?: IUserGroup[]
    loved_beatmapset_count?: number
    monthly_playcounts?: IUserMonthlyPlaycount[]

    //api docs are missing those ones
    page?: {
        html: string
        raw: string
    }
    pending_beatmapset_count?: number
    previous_usernames?: string[]
    rank_history?: {
        mode: OsuGameMode
        data: number[]
    }
    ranked_beatmapset_count?: number
    replays_watched_counts?: IReplaysWatchedCount[]

    scores_best_count?: number
    scores_first_count?: number
    scores_recent_count?: number

    statistics?: IStatistics

    statistics_rulesets?: any //IUserStatisticsRulesets - not listed in api at all

    support_level?: number
    unread_pm_count?: any //not listed in api
    user_achievements?: IUserAchievement
    user_preferences?: any //not listed in api

    country?: IOsuCountry
    is_restricted?: boolean
    cover?: IOsuCover
}

export type IOsuUser = IOsuUserCompact & {
    cover_url: string
    discord?: string
    has_supported: boolean
    interests?: string
    join_date: Date
    kudosu: {
        available: number
        total: number
    }
    location?: string
    max_blocks: number
    max_friends: number
    occupation?: string
    playmode: OsuGameMode
    playstyle: string[]
    post_count: number
    title?: string
    title_url?: string
    twitter?: string
    website?: string
    country: IOsuCountry
    cover: IOsuCover
}

type IOsuCountry = {
    code: string
    name: string
}

type IOsuCover = {
    custom_url: string
    url: string
    id: null //not sure about this one
}

type IUserAccountHistory = {
    description?: string
    id: number
    length: number // In seconds
    timestamp: Date
    type: "note" | "restriction" | "silence"
}

type IUserBadge = {
    awarded_at: Date
    description: string
    image_url: string
    url: string
}

type IProfileBanner = {
    id: number
    tournament_id: number
    image: string
}

type IGroup = {
    colour?: string
    has_listing: boolean //Whether this group displays a listing at `/groups/{id}`.
    has_playmodes: boolean //Whether this group associates GameModes with users' memberships.
    id: number
    identifier: string //Unique string to identify the group.
    is_probationary: boolean //Whether members of this group are considered probationary.
    name: string
    short_name: string //Short name of the group for display.
}

type IUserGroup = IGroup & {
    playmodes?: OsuGameMode[] //null if `has_playmodes` is unset
}

type IUserMonthlyPlaycount = {
    start_date: string
    count: number
}

type IStatistics = {
    level: {
        current: number
        progress: number
    }
    pp: number
    global_rank: number
    ranked_score: number
    hit_accuracy: number
    play_count: number
    play_time: number
    total_score: number
    total_hits: number
    maximum_combo: number
    replays_watched_by_others: number
    is_ranked: boolean
    grade_counts: {
        ss: number
        ssh: number
        s: number
        sh: number
        a: number
    }
    rank: {
        global: number
        country: number
    }
}

type IUserAchievement = {
    achieved_at: Date
    achievement_id: number
}

type IReplaysWatchedCount = {
    start_date: string
    count: number
}