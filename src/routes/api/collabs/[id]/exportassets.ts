import type { RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { Jwt } from '../../../../jwt';
import { Prisma } from '../../../../database/prisma';
import { DiscordUser } from '../../../../utils/discord/user';
import { ServerPaths } from '../../../../utils/paths/server';
import { readFileSync } from 'fs';
import path from 'path';
import JSZip from 'jszip';

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

    if (!user || !user.admin || userId !== "687004886922952755") {
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
            pick: {
                include: {
                    assets: {
                        include: {
                            collabAsset: true
                        }
                    }
                }
            }
        }
    });

    let file_return = undefined;
    var zip = new JSZip();

    let count = 0;

    participants.forEach(participant => {

        let pick = participant.pick;
        let assets = pick.assets;

        assets.forEach(asset => {
            const file =
                ServerPaths.generateAssetName(pick.id, asset.collabAssetId, asset.collabAsset.assetType) + '.png';

            const filePath = path.join(
                ServerPaths.asset(pick.collabId, pick.id, asset.collabAssetId),
                file
            );
            console.log(filePath);
            zip.folder(asset.collabAsset.assetType)?.file(`${count}.png`, readFileSync(filePath))
        })

        count++;
    })


    return {
        status: 200,
        headers: {
            'Content-type': 'application/zip;charset=utf-8;',
            'Content-Disposition': 'attachment; filename=userdata.csv'
        },
        body: await zip.generateAsync({ type: "uint8array" })
    };
};
