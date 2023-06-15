import { BumpState, type Asset, type Collab, type CollabAsset, type Pick } from '@prisma/client';
import { CronJob } from 'cron';
import { MessageEmbed } from 'discord.js';
import { DiscordBot } from '../bot/discord';
import { Prisma } from '../database/prisma';
import { Env } from '../env';
import { deletePick, sendEmbedToDiscord } from '../routes/api/picks/[id]';
import { DiscordUser } from '../utils/discord/user';

async function sendBumpEmbed(
	pick: Pick & { assets: Asset[]; collab: Collab & { collabAssets: CollabAsset[] } },
	time: Date,
	last = false
) {
	const env = Env.load();
	const serverId = env['DISCORD_SERVER_ID'];
	const channelId = env['DISCORD_BUMPS_CHANNEL_ID'];

	let valid = pick.valid;

	if (pick.assets.length !== pick.collab.collabAssets.length) {
		valid = false;
	}

	let message = `<@${pick.userId}>, it is time for you to bump. The bump ends <t:${Math.round(
		time.getTime() / 1000
	)}:R>.`;

	if (last) {
		message +=
			" **You have missed the two previous bumps. If you don't bump your pick will be deleted!**";
	}

	const embed: MessageEmbed = new MessageEmbed({
		title: `**Bump instructions**`,
		description: `Your pick **${pick.name}** needs to be bumped. Here are the instructions to bump. If you miss 3 bumps in a row your pick will be deleted.`,
		color: 0xff0000,
		fields: [
			{
				name: 'Step 1',
				value: 'Go to the bumps channel (discord), or go to your profile (website)',
				inline: false
			},
			{
				name: 'Step 2',
				value: 'Type /bump (discord), or click the bump button (website)',
				inline: false
			}
		]
	});

	if (!valid) {
		embed.addFields({
			name: 'Step 3',
			value:
				"Your pick currently isn't complete. Please update your pick on the website, and make sure you have all images uploaded/valid, or your pick will be deleted.",
			inline: false
		});
	}

	const guild = await DiscordBot.client.guilds.fetch({ guild: serverId });
	const channel = guild.channels.cache.get(channelId);
	if (channel && channel.type === 'GUILD_TEXT') {
		await channel.send({
			content: message,
			embeds: [embed]
		});
	}
}

export abstract class Bumps {
	static started = false;
	static processing = false;

	static async start() {
		if (!Bumps.started) {
			Bumps.started = true;

			new CronJob('*/15 * * * *', Bumps.process, null, true);
		}
	}

	static async process() {
		if (Bumps.processing) {
			return;
		}

		Bumps.processing = true;

		const time = new Date();
		const previousTime = new Date(time.toISOString());
		previousTime.setHours(time.getHours() - 24 * 5);
		const futureTime = new Date(time.toISOString());
		futureTime.setHours(time.getHours() + 24 * 2);

		await Bumps.closeOld(time);

		let offset = 0;
		let picks = [];

		while (offset === 0 || picks.length > 0) {
			picks = await Prisma.client.pick.findMany({
				where: {
					AND: {
						collab: {
							AND: [
								{
									status: {
										notIn: ['DESIGN', 'RELEASE']
									}
								},
								{ bumpStatus: 'ENABLED' }
							]
						},
						createdAt: {
							lte: time
						},
						bumps: {
							none: {
								createdAt: {
									gte: previousTime
								}
							}
						}
					}
				},
				include: {
					assets: true,
					collab: {
						include: {
							collabAssets: true
						}
					},
					bumps: {
						orderBy: {
							createdAt: 'desc'
						},
						take: 3
					}
				},
				take: 50,
				skip: offset
			});

			for (let i = 0; i < picks.length; i++) {
				const pick = picks[i];

				await Prisma.client.bump.create({
					data: {
						createdAt: time,
						pickId: pick.id,
						state: 'OPEN',
						userId: pick.userId
					}
				});

				const thirdInRow =
					pick.bumps.length >= 3 &&
					pick.bumps[0].state === 'MISSED' &&
					pick.bumps[1].state === 'MISSED';

				await sendBumpEmbed(pick, futureTime, thirdInRow);
			}

			offset += 50;
		}

		Bumps.processing = false;
	}

	static async closeOld(now: Date) {
		const date = new Date(now.toISOString());
		date.setHours(date.getHours() - 48);

		let offset = 0;
		let bumps = [];

		while (offset === 0 || bumps.length > 0) {
			bumps = await Prisma.client.bump.findMany({
				where: {
					AND: {
						createdAt: {
							lt: date
						},
						state: 'OPEN'
					}
				},
				include: {
					pick: {
						include: {
							bumps: {
								orderBy: {
									createdAt: 'desc'
								},
								take: 3
							},
							assets: true
						}
					}
				},
				take: 50,
				skip: offset
			});

			for (let i = 0; i < bumps.length; i++) {
				const bump = bumps[i];

				if (bump.pick.bumps.length < 3) {
					continue;
				} else {
					if (bump.pick.bumps[1].state === 'MISSED' && bump.pick.bumps[2].state === 'MISSED') {
						await Bumps.bumpsMissed(bump.pick);
					}
				}
			}

			offset += 50;
		}

		await Prisma.client.bump.updateMany({
			where: {
				AND: {
					createdAt: {
						lt: date
					},
					state: 'OPEN'
				}
			},
			data: {
				state: BumpState.MISSED
			}
		});
	}

	static async bumpsMissed(pick: Pick & { assets: Asset[] }) {
		await deletePick(pick);

		const user = await DiscordUser.getUser(pick.userId);

		if (user) {
			await sendEmbedToDiscord({
				pick,
				user,
				reason: 'You have missed 3 bumps in a row.'
			});
		}
	}

	static async bump(userId: string): Promise<boolean> {
		const updated = await Prisma.client.bump.updateMany({
			where: {
				AND: {
					userId: userId,
					state: 'OPEN'
				}
			},
			data: {
				state: BumpState.CLOSED,
				createdAt: new Date()
			}
		});

		return updated.count > 0;
	}
}
