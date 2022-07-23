import type { RequestHandler } from '@sveltejs/kit';
import { SentryClient } from '../../bot/sentry';
import { DiscordBot } from '../../bot/discord';
import { Env } from '../../env';
import cookie from 'cookie';
import { Jwt } from '../../jwt';
import OAuth from 'discord-oauth2';
import { Prisma } from '../../database/prisma';
import axios from 'axios';
import { getUpdatedDiscordUser } from './discord/user';
import { getUpdatedOsuUser } from './osu/access';
import type { Osu, OsuMode } from '@prisma/client';
import type { IDiscordUser } from '../../database/discord_user';
import { MessageEmbed } from 'discord.js';

function getPlayTime(time: number): string {
	const total = time / 60 / 60;
	const hours = Math.floor(total);
	const minutes = Math.floor((total - hours) * 60);
	return hours + 'h ' + minutes + 'm';
}

async function sendEmbedToDiscord(data: {
	osu: Osu & { modes: OsuMode[] };
	gamemode: OsuMode;
	user: IDiscordUser;
	vpnFactor: number;
	guildCount: number;
}) {
	const env = Env.load();

	const serverId = env['DISCORD_SERVER_ID'];
	const channelId = env['DISCORD_VERIFICATION_CHANNEL_ID'];

	let vpnMessage = '';

	if (data.vpnFactor >= 0.9) {
		vpnMessage = 'Very likely to use a VPN';
	}
	if (data.vpnFactor < 0.9 && data.vpnFactor >= 0.6) {
		vpnMessage = 'Likely to use a VPN';
	}
	if (data.vpnFactor < 0.6 && data.vpnFactor >= 0.2) {
		vpnMessage = 'VPN usage possible';
	}
	if (data.vpnFactor < 0.2 && data.vpnFactor >= 0.05) {
		vpnMessage = 'Unlikely to use a VPN';
	}
	if (data.vpnFactor < 0.05 && data.vpnFactor >= 0) {
		vpnMessage = 'No VPN';
	}

	const mention = `<@${data.user.id}>`;

	const embed: MessageEmbed = new MessageEmbed({
		title: `Sussy verification from **${data.user.username}#${data.user.discriminator}**`,
		description: `osu! name: **${data.osu.username}**`,
		color: 0x00ff00,
		fields: [
			{
				name: 'Joined Discord',
				value: data.user.creation_date?.toLocaleString() ?? 'Unknown',
				inline: true
			},
			{
				name: 'Joined osu!',
				value: data.osu.creation_date?.toLocaleString() ?? 'Unknown',
				inline: true
			},
			{
				name: 'User osu! profile',
				value: `https://osu.ppy.sh/users/${data.osu.id}`,
				inline: false
			},
			{
				name: 'Discord ID',
				value: data.user.id,
				inline: false
			},
			{
				name: 'Discord Mention',
				value: mention,
				inline: false
			},
			{
				name: 'Country',
				value: data.osu.country,
				inline: false
			},
			{
				name: 'Restricted',
				value: data.osu.restricted ? 'Yes' : 'No',
				inline: false
			},
			{
				name: 'Rank',
				value: data.gamemode.rank?.toString() ?? 'Unknown',
				inline: true
			},
			{
				name: 'Country Rank',
				value: data.gamemode.countryRank?.toString() ?? 'Unknown',
				inline: true
			},
			{
				name: 'Playtime',
				value: getPlayTime(data.gamemode.playTime ?? 0),
				inline: true
			},
			{
				name: 'Playcount',
				value: data.gamemode.playCount?.toString() ?? 'Unknown',
				inline: true
			},
			{
				name: 'Discord Server Count',
				value: data.guildCount.toString(),
				inline: true
			},
			{
				name: 'VPN Factor',
				value: vpnMessage,
				inline: true
			}
		]
	});

	const guild = await DiscordBot.client.guilds.fetch({ guild: serverId });
	const channel = guild.channels.cache.get(channelId);
	if (channel && channel.type === 'GUILD_TEXT') {
		const msg = await channel.send({ embeds: [embed] });
		await msg.react('✅');
		await msg.react('❌');
	}
}

export const get: RequestHandler = async ({ request }) => {
	try {
		const env = Env.load();

		const serverId = env['DISCORD_SERVER_ID'];
		const roleId = env['DISCORD_VERIFIED_ROLE_ID'];

		const cookieHeader = request.headers.get('cookie');
		const cookies = cookie.parse(cookieHeader ?? '');
		const decoded = Jwt.decode(cookies['discord_token']);
		const token = decoded['access_token'] as string;

		const decodedUser = Jwt.decode(cookies['user_id']);
		const userId = decodedUser['user_id'] as string;

		if (!userId || !token) {
			return {
				status: 401
			};
		}

		const guild = await DiscordBot.client.guilds.fetch({ guild: serverId });

		const client = new OAuth({
			clientId: env['DISCORD_CLIENT_ID'],
			clientSecret: env['DISCORD_CLIENT_SECRET']
		});

		const guilds = await client.getUserGuilds(token);

		// !! verification data

		const guildCount = guilds.length;
		const user = await getUpdatedDiscordUser(userId);

		if (!user) {
			return {
				status: 400,
				body: {
					message: 'User not found'
				}
			};
		}

		await Prisma.client.user.update({
			where: {
				discordId: userId
			},
			data: {
				discordId: user.id,
				username: user.username,
				discriminator: user.discriminator,
				avatar: user.avatar,
				joinedAt: user.joinedAt,
				creation_date: user?.creation_date
			}
		});

		await getUpdatedOsuUser(userId);

		const osu = await Prisma.client.osu.findUnique({
			where: {
				discordId: userId
			},
			include: {
				modes: {
					where: {
						selected: true
					}
				}
			}
		});

		if (!osu) {
			return {
				status: 400,
				body: {
					message: 'No osu data found'
				}
			};
		}

		const ip = request.headers.get('CF-Connecting-IP');
		let vpnFactor = 0;

		if (ip) {
			vpnFactor = (
				await axios.get(
					`http://check.getipintel.net/check.php?ip=${ip}&flags=m&contact=${env['IP_INTEL_CONTACT']}`
				)
			).data;
		}

		// !! honestly this is probably the shittiest code I have written in years

		let sus = false;

		if (guildCount < 5) {
			sus = true;
		}

		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		if (osu.restricted) {
			sus = true;
		}

		if (user.creation_date && new Date(user.creation_date) > sixMonthsAgo) {
			sus = true;
		}

		if (osu.creation_date && new Date(osu.creation_date) > sixMonthsAgo) {
			sus = true;
		}

		const gamemode = osu.modes[0];

		if (gamemode.level && gamemode.level < 50) {
			sus = true;
		}

		if (gamemode.pp && gamemode.pp < 3000) {
			sus = true;
		}

		if (gamemode.playCount && gamemode.playCount < 30000) {
			sus = true;
		}

		const playTime = (gamemode.playTime ?? 0) / 60 / 60 / 24;

		if (playTime < 7) {
			sus = true;
		}

		if (vpnFactor >= 0.2) {
			sus = true;
		}

		const data = {
			osu,
			gamemode,
			user,
			vpnFactor,
			guildCount
		};

		if (sus) {
			sendEmbedToDiscord(data);
		}

		const unverifiedRole = env['DISCORD_UNVERIFIED_ROLE_ID'];

		const guildMember = await guild.members.fetch(user.id);
		guildMember.roles.add(roleId);
		guildMember.roles.remove(unverifiedRole);
		// because xeg is too lazy to have another bot do it
		// TODO: implement dynamic way of setting roles
		guildMember.roles.add('630980373374828544');

		await Prisma.client.user.update({
			where: {
				discordId: userId
			},
			data: {
				verified: true
			}
		});

		return {
			status: 200
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};
