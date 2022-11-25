import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../../jwt';
import { Prisma } from '../../../../database/prisma';
import { DiscordUser } from '../../../../utils/discord/user';

export const get: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	const collab = await Prisma.client.collab.findUnique({
		where: {
			id: params.id
		},
		include: {
			collabAssets: true
		}
	});

	if (!collab) {
		return {
			status: 404,
			body: {
				message: 'Collab not found'
			}
		};
	}

	const user = await DiscordUser.getUser(userId, token);

	if (!user || !user.admin || userId !== '687004886922952755') {
		return {
			status: 403
		};
	}

	const participants = await Prisma.client.participant.findMany({
		orderBy: [
			{
				createdAt: 'asc'
			}
		],
		where: {
			collabId: collab.id
		},
		include: {
			user: {
				include: {
					roles: true,
					osu: {
						include: {
							modes: true
						}
					}
				}
			},
			pick: {
				include: {
					character: true
				}
			}
		}
	});

	let csv =
		'osu_id;osu_name;hex_ranks;av_name;charname;id;db_id;series;specialty;gamemode;rank;level;banner_name;card_name;banner_quote;card_quote;prestige;supporter_tier;fav_mod;country\n';

	let count = 0;

	participants.forEach((participant) => {
		let osu_id = '';
		let osu_name = '';
		let hex_ranks = '';
		let av_name = '';
		let charname = '';
		const id = count;
		const db_id = participant.id;
		let series = '';
		let specialty = '';
		let gamemode = '';
		let rank = '';
		let level = '';
		let banner_name = '';
		let card_name = '';
		let banner_quote = '';
		let card_quote = '';
		let prestige = '';
		let supporter_tier = '';
		let fav_mod = '';
		let country = '';

		if (participant.user != null) {
			supporter_tier = getSupporterTier(participant.user.roles);
			prestige = getPrestige(participant.user.roles);

			if (participant.pick != null) {
				// This should be typed sometime!
				const extra: any = participant.pick.extra;

				if (extra != null) {
					fav_mod = extra.mod == null ? '' : extra.mod;
					av_name = extra.avatar == null ? '' : extra.avatar;
					specialty = extra.specialty == null ? '' : extra.specialty;

					const banner = extra.banner;

					if (banner != null) {
						banner_name = banner.name == null ? '' : banner.name;
						banner_quote = banner.quote == null ? '' : banner.quote;
					}

					const card = extra.card;

					if (card != null) {
						card_name = card.name == null ? '' : card.name;
						card_quote = card.quote == null ? '' : card.quote;
					}

					const skills = extra.skills;

					if (skills != null) {
						const stamina = skills.stamina == null ? 'S' : skills.stamina;
						const tenacity = skills.tenacity == null ? 'S' : skills.tenacity;
						const precision = skills.precision == null ? 'S' : skills.precision;
						const reaction = skills.reaction == null ? 'S' : skills.reaction;
						const accuracy = skills.accuracy == null ? 'S' : skills.accuracy;
						const agility = skills.agility == null ? 'S' : skills.agility;

						hex_ranks = `${stamina + tenacity + precision + reaction + accuracy + agility}`;
					}
				}

				if (participant.pick.character != null) {
					charname = participant.pick.character.name == null ? '' : participant.pick.character.name;
					series =
						participant.pick.character.anime_name == null
							? ''
							: participant.pick.character.anime_name;
				}
			}

			if (participant.user.osu != null) {
				osu_name = participant.user.osu.username == null ? '' : participant.user.osu.username;
				country = participant.user.osu.country == null ? '' : participant.user.osu.country;

				if (participant.user.osu.modes != null) {
					participant.user.osu.modes.forEach((mode) => {
						if (mode.selected === true) {
							osu_id = mode.osuId == null ? '' : mode.osuId;
							gamemode = mode.gamemode == null ? '' : mode.gamemode;
							level = mode.level == null ? '' : mode.level.toString();
							rank = mode.rank == null ? '' : `#${mode.rank.toLocaleString().replace(',', '.')}`;
						}
					});
				}
			}
		}

		csv += `${osu_id};${osu_name};${hex_ranks};${av_name};${charname};${id};${db_id};${series};${specialty};${gamemode};${rank};${level};${banner_name};${card_name};${banner_quote};${card_quote};${prestige};${supporter_tier};${fav_mod};${country}\n`;

		count++;
	});

	return {
		status: 200,
		headers: {
			'Content-type': 'text/csv;charset=utf-8;',
			'Content-Disposition': 'attachment; filename=userdata.csv'
		},
		body: csv
	};
};

function getSupporterTier(roles: Array<any>) {
	let tier = 0;

	roles.forEach((role) => {
		switch (role.discordRoleId) {
			case '861679323739717642':
				if (tier < 6) tier = 6;
				break;
			case '787723186556108840':
				if (tier < 5) tier = 5;
				break;
			case '787388721255153694':
				if (tier < 4) tier = 4;
				break;
			case '787388728795987969':
				if (tier < 3) tier = 3;
				break;
			case '767452000777535488':
				if (tier < 2) tier = 2;
				break;
			case '963221388892700723':
				if (tier < 1) tier = 1;
				break;
			default:
				tier = 0;
				break;
		}
	});

	if (tier === 0) {
		return '';
	} else {
		return tier.toLocaleString();
	}
}

function getPrestige(roles: Array<any>) {
	let prestige = 0;

	roles.forEach((role) => {
		switch (role.discordRoleId) {
			case '963258579165524008':
				if (prestige < 6) prestige = 6;
				break;
			case '963258567425658910':
				if (prestige < 5) prestige = 5;
				break;
			case '963258542930931732':
				if (prestige < 4) prestige = 4;
				break;
			case '963258518767534080':
				if (prestige < 3) prestige = 3;
				break;
			case '963258497376583780':
				if (prestige < 2) prestige = 2;
				break;
			case '963258467928408134':
				if (prestige < 1) prestige = 1;
				break;
			default:
				prestige = 0;
				break;
		}
	});

	if (prestige === 0) {
		return '';
	} else {
		return prestige.toLocaleString();
	}
}
