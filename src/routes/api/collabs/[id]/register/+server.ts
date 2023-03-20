import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { Prisma } from '../../../../../database/prisma';
import { Jwt } from '../../../../../jwt';
import { isCollabOpen } from '../open/+server';
import cookie from 'cookie';
import type { Pick } from '@prisma/client';
import { SentryClient } from '../../../../../bot/sentry';
import { DiscordUser } from '../../../../../utils/discord/user';

export const POST: RequestHandler = async ({ request, params }) => {
	const cookieHeader = request.headers.get('cookie');
	const cookies = cookie.parse(cookieHeader ?? '');
	const decoded = Jwt.decode(cookies['discord_token']);
	const token = decoded['access_token'] as string;

	const decodedUser = Jwt.decode(cookies['user_id']);
	const userId = decodedUser['user_id'] as string;

	try {
		if (!token) {
			return json(
				{
					message: 'errors.unauthorized'
				},
				{
					status: 401
				}
			);
		}

		const user = await DiscordUser.getUser(userId, token);

		if (!user) {
			return json(
				{
					message: 'errors.unauthorized'
				},
				{
					status: 403
				}
			);
		}

		const collab = await Prisma.client.collab.findUnique({
			where: {
				id: params.id
			}
		});

		if (!collab) {
			return json(
				{
					message: 'errors.collab_not_found'
				},
				{
					status: 404
				}
			);
		}

		if (!isCollabOpen(collab, user)) {
			return json(
				{
					message: 'errors.collab_closed'
				},
				{
					status: 403
				}
			);
		}

		const body: Pick = await request.json();

		const existingPicks = await Prisma.client.pick.findMany({
			where: {
				collabId: collab.id,
				userId: userId
			},
			take: 1
		});

		if (existingPicks.length > 0) {
			return json(
				{
					message: 'errors.already_picked'
				},
				{
					status: 420
				}
			);
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
				return json(
					{
						message: 'errors.duplicate_pick'
					},
					{
						status: 422
					}
				);
			}
		}

		const pick = await Prisma.client.pick.create({
			data: {
				collabId: collab.id,
				userId: userId,
				characterId: body.characterId,
				extra: body.extra ?? undefined,
				name: body.name,
				original: body.characterId ? false : true,
				valid: true
			}
		});

		await Prisma.client.participant.create({
			data: {
				collabId: collab.id,
				userId: userId,
				pickId: pick.id
			}
		});

		return json(pick);
	} catch (error) {
		SentryClient.log(error, await request.json());

		return new Response(undefined, { status: 400 });
	}
};
