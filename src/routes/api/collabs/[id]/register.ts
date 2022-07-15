import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../database/prisma';
import { Jwt } from '../../../../jwt';
import { getUser } from '../../discord/user';
import { isCollabOpen } from './open';
import cookie from 'cookie';
import type { Pick } from '@prisma/client';
import { SentryClient } from '../../../../bot/sentry';

export const post: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	try {
		if (!token) {
			return {
				status: 401
			};
		}

		const user = await getUser(token, userId);

		if (!user) {
			return {
				status: 403
			};
		}

		const collab = await Prisma.client.collab.findUnique({
			where: {
				id: params.id
			}
		});

		if (!collab) {
			return {
				status: 404
			};
		}

		if (!isCollabOpen(collab, user)) {
			return {
				status: 403
			};
		}

		const body: Pick = await request.json();

		const existingPicks = await Prisma.client.pick.findMany({
			where: {
				collabId: collab.id,
				userId: userId
			}
		});

		if (existingPicks.length > 0) {
			return {
				status: 400,
				body: {
					message: 'You already have a pick for this collab'
				}
			};
		}

		if (body.characterId) {
			const duplicatePick = await Prisma.client.pick.findUnique({
				where: {
					collabId_characterId: {
						collabId: collab.id,
						characterId: body.characterId
					}
				}
			});

			if (duplicatePick) {
				return {
					status: 400,
					body: {
						message: 'This character has already been picked'
					}
				};
			}
		}

		const pick = await Prisma.client.pick.create({
			data: {
				collabId: collab.id,
				userId: userId,
				characterId: body.characterId,
				extra: body.extra ?? undefined,
				name: body.name
			}
		});

		await Prisma.client.participant.create({
			data: {
				collabId: collab.id,
				userId: userId,
				pickId: pick.id
			}
		});

		return {
			status: 200,
			body: pick
		};
	} catch (error) {
		SentryClient.log(error);

		return {
			status: 400
		};
	}
};
