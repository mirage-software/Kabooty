import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../../../jwt';
import { Prisma } from '../../../../../database/prisma';
import { DiscordUser } from '../../../../../utils/discord/user';
import { ServerPaths } from '../../../../../utils/paths/server';
import { mkdirSync, readFileSync, createWriteStream, createReadStream } from 'fs';
import path from 'path';
import archiver from 'archiver';
import * as mime from 'mime-types';

export const GET: RequestHandler = async ({ request, params }) => {
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
		return json(
			{
				message: 'Collab not found'
			},
			{
				status: 404
			}
		);
	}

	const user = await DiscordUser.getUser(userId, token);

	if (
		!user ||
		!user.admin ||
		(userId !== '687004886922952755' && userId !== '203932549746130944')
	) {
		return new Response(undefined, { status: 403 });
	}

	const count = await Prisma.client.pick.count({
		where: {
			collabId: collab.id
		}
	});

	const max = 100;
	const total_pages = Math.ceil(count / max);
	const archive = archiver('zip', {
		zlib: { level: 9 } // Sets the compression level.
	});

	// Generate ZIP for the export
	const zipPath = path.join(ServerPaths.collab(collab.id), '/export/', 'export.zip');
	const jsonPath = path.join(ServerPaths.collab(collab.id), '/export/', 'export.json');

	mkdirSync(path.dirname(zipPath), { recursive: true });

	const jsonStream = createWriteStream(jsonPath);
	const zipStream = createWriteStream(zipPath);

	archive.pipe(zipStream);
	jsonStream.write('[');

	for (let page = 0; page <= total_pages; page++) {
		const picks = await Prisma.client.pick.findMany({
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
				character: true,
				assets: {
					include: {
						collabAsset: true
					}
				}
			},
			take: 100,
			skip: 100 * page
		});

		let process_counter = 100 * page;

		let json_chunk = '';

		picks.forEach((pick) => {
			json_chunk += buildcsv(pick, process_counter);
			json_chunk += ',';

			buildassets(pick, archive, process_counter);

			process_counter++;
		});

		jsonStream.write(json_chunk);
	}

	jsonStream.write(']');

	jsonStream.close();

	archive.append(createReadStream(jsonPath), { name: 'data.json' });

	archive.finalize();

	await new Promise((fulfill) => zipStream.on('close', fulfill));

	const file = readFileSync(zipPath);

	const contentType = mime.contentType('export.zip') || 'application/octet-stream';

	return new Response(file, {
		headers: {
			'Content-Type': contentType,
			'cache-control': 'public, max-age=172800'
		}
	});
};

function buildassets(pick: any, archive: any, process_counter: number) {
	const assets = pick.assets;

	assets.forEach((asset: any) => {
		const file =
			ServerPaths.generateAssetName(pick.id, asset.collabAssetId, asset.collabAsset.assetType) +
			'.png';

		const filePath = path.join(
			ServerPaths.asset(pick.collabId, pick.id, asset.collabAssetId),
			file
		);

		archive.append(createReadStream(filePath), {
			name: `${asset.collabAsset.assetType}/${process_counter}.png`
		});
	});
}

function buildcsv(pick: any, count: number) {
	let osu_id = '';
	let osu_name = '';
	let hex_ranks = '';
	let av_name = '';
	let charname = '';
	const id = count;
	const db_id = pick.id;
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

	if (pick.user != null) {
		supporter_tier = getSupporterTier(pick.user.roles);
		prestige = getPrestige(pick.user.roles);

		if (pick != null) {
			// This should be typed sometime!
			const extra: any = pick.extra;

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

			if (pick.character != null) {
				charname = pick.character.name == null ? '' : pick.character.name;
				series = pick.character.anime_name == null ? '' : pick.character.anime_name;
			}
		}

		if (pick.user.osu != null) {
			osu_name = pick.user.osu.username == null ? '' : pick.user.osu.username;
			country = pick.user.osu.country == null ? '' : pick.user.osu.country;

			if (pick.user.osu.modes != null) {
				pick.user.osu.modes.forEach((mode: any) => {
					if (mode.selected === true) {
						osu_id = mode.osuId == null ? '' : mode.osuId;
						gamemode = mode.gamemode == null ? '' : mode.gamemode;
						level = mode.level == null ? '' : mode.level.toString();
						rank = mode.rank == null ? '' : `#${mode.rank.toLocaleString().replace(',', '.')}`;
					}
				});
			}
		}

		if (pick.original == true) {
			charname = pick.name;
			series = 'custom';
		}
	}

	let export_object: any = {
		osu_id: osu_id,
		osu_name: osu_name,
		hex_ranks: hex_ranks,
		av_name: av_name,
		charname: charname,
		id: id,
		db_id: db_id,
		series: series,
		specialty: specialty,
		gamemode: gamemode,
		rank: rank,
		level: level,
		banner_name: banner_name,
		card_name: card_name,
		banner_quote: banner_quote,
		card_quote: card_quote,
		prestige: prestige,
		supporter_tier: supporter_tier,
		fav_mod: fav_mod,
		country: country
	};

	return JSON.stringify(export_object);
}

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
		}
	});

	if (prestige === 0) {
		return '';
	} else {
		return prestige.toLocaleString();
	}
}
