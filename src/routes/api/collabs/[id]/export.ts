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

	if (!user || !user.admin) {
		return {
			status: 403
		};
	}

	const participatns = await Prisma.client.participant.findMany({
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

	participatns.forEach((participatn) => {
		let osu_id = '';
		let osu_name = '';
		let hex_ranks = '';
		let av_name = '';
		let charname = '';
		let id = count;
		let db_id = participatn.id;
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

		if (participatn.user != null) {
			if (participatn.pick != null) {
				// This should be typed sometime!
				let extra: any = participatn.pick.extra;

				if (extra != null) {
					fav_mod = extra.mod == null ? '' : extra.mod;
					av_name = extra.avatar == null ? '' : extra.avatar;
					specialty = extra.specialty == null ? '' : extra.specialty;

					let banner = extra.banner;

					if (banner != null) {
						banner_name = banner.name == null ? '' : banner.name;
						banner_quote = banner.quote == null ? '' : banner.quote;
					}

					let card = extra.card;

					if (card != null) {
						card_name = card.name == null ? '' : card.name;
						card_quote = card.quote == null ? '' : card.quote;
					}

					let skills = extra.skills;

					if (skills != null) {
						let stamina = skills.stamina == null ? 'S' : skills.stamina;
						let tenacity = skills.tenacity == null ? 'S' : skills.tenacity;
						let precision = skills.precision == null ? 'S' : skills.precision;
						let reaction = skills.reaction == null ? 'S' : skills.reaction;
						let accuracy = skills.accuracy == null ? 'S' : skills.accuracy;
						let agility = skills.agility == null ? 'S' : skills.agility;

						hex_ranks = `${stamina + tenacity + precision + reaction + accuracy + agility}`;
					}
				}

				if (participatn.pick.character != null) {
					charname = participatn.pick.character.name == null ? '' : participatn.pick.character.name;
					series =
						participatn.pick.character.anime_name == null
							? ''
							: participatn.pick.character.anime_name;
				}
			}

			if (participatn.user.osu != null) {
				osu_name = participatn.user.osu.username == null ? '' : participatn.user.osu.username;
				country = participatn.user.osu.country == null ? '' : participatn.user.osu.country;

				if (participatn.user.osu.modes != null) {
					participatn.user.osu.modes.forEach((mode) => {
						if (mode.selected === true) {
							osu_id = mode.osuId == null ? '' : mode.osuId;
							gamemode = mode.gamemode == null ? '' : mode.gamemode;
							level = mode.level == null ? '' : mode.level.toString();
							rank = mode.rank == null ? '' : mode.rank.toString();
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
