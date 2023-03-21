<script lang="ts">
	import { goto } from '$app/navigation';

	import { onDestroy, onMount } from 'svelte';

	import axios from 'axios';
	import {
		discord,
		getDiscordProfilePicture,
		getFormattedDate
	} from '../../../../../../stores/discord';
	import type { AnimeCharacter, Asset, CollabAsset, User, Pick, Collab } from '@prisma/client';
	import { ClientPaths } from '../../../../../../utils/paths/client';
	import { _ } from 'svelte-intl-precompile';
	import { page } from '$app/stores';
	import Extra from '../../../../../../components/collabs/register/extra.svelte';
	import AssetComponent from '../../../../../../components/collabs/pick/asset.svelte';
	import Character from '../../../../../../components/collabs/register/character.svelte';
	import { selected } from '../../../../../../components/collabs/register/character/selected_store';
	import type { Unsubscriber } from 'svelte/store';
	import type { IDiscordRole } from '../../../../../../utils/discord/interfaces/role';
	import type { IDiscordUser } from '../../../../../../utils/discord/interfaces/user';

	let pick: Pick & {
		user: User;
		character: AnimeCharacter;
		assets: (Asset & { collabAsset: CollabAsset })[];
		collab: Collab & {
			collabAssets: CollabAsset[];
		};
	};

	let subscription: Unsubscriber | undefined;

	let discordUser: IDiscordUser;

	onMount(async () => {
		const collabId = $page.params['id'];
		const pickId = $page.params['pick_id'];
		const pickRoute = '/collabs/' + collabId + '/picks/' + pickId;

		const result = await axios.get('/api/auth/discord/authenticated');

		if (!result.data.authenticated) {
			goto(pickRoute);
			return;
		}

		const _pick: Pick & {
			user: User;
			character: AnimeCharacter;
			assets: (Asset & { collabAsset: CollabAsset })[];
			collab: Collab & {
				collabAssets: CollabAsset[];
			};
		} = (await axios.get('/api/picks/' + pickId)).data;
		discordUser = (await axios.get('/api/auth/discord/user/' + _pick.userId)).data;

		subscription = discord.subscribe((user) => {
			if (!user) {
				// Wait, since the user is authenticated
				return;
			}

			if (user && (user.id === _pick.userId || user.admin)) {
				pick = _pick;
			} else {
				goto(pickRoute);
			}
		});
	});

	onDestroy(() => {
		if (subscription) {
			subscription();
		}
	});

	function getDisplayRoles(roles: IDiscordRole[]) {
		return roles.filter((role) => {
			return role.display;
		});
	}

	async function updatePick(data: Partial<Pick>) {
		const pickId = $page.params['pick_id'];

		await axios.put('/api/picks/' + pickId, data);

		pick = (await axios.get('/api/picks/' + pickId)).data;
	}

	async function removeAsset(collabAssetId: string) {
		const assetIndex = pick.assets.findIndex((_) => {
			return _.collabAssetId === collabAssetId;
		});

		pick.assets.splice(assetIndex, 1);

		pick = pick;
	}
</script>

{#if $discord && pick && discordUser}
	<div id="column">
		<div id="discord">
			<div id="user">
				<div id="discord-stats">
					<img id="avatar" src={getDiscordProfilePicture(discordUser)} alt="Discord avatar" />
					<div id="stats">
						<div class="stat">
							<i class="las la-user" />
							<p>{discordUser.username + '#' + discordUser.discriminator}</p>
						</div>
						{#if discordUser.joinedAt}
							<div class="stat">
								<i class="las la-calendar" />
								<p>Joined {getFormattedDate(discordUser.joinedAt.toString())}</p>
							</div>
						{/if}
						{#if discordUser.roles && getDisplayRoles(discordUser.roles).length > 0}
							<div class="stat">
								<i class="las la-tags roleicon" />
								<div id="roles">
									{#each getDisplayRoles(discordUser.roles) as role}
										<div id="role">
											<p>{role.name}</p>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<div id="content">
			<div id="assets">
				{#each pick.collab.collabAssets as collabAsset}
					<AssetComponent
						{collabAsset}
						asset={pick.assets.find((_) => {
							return _.collabAssetId === collabAsset.id;
						})}
						submit={async (image, _, pixels) => {
							const asset = (
								await axios.post(
									ClientPaths.asset(pick.collab.id, pick.id, collabAsset.id),
									image,
									{
										headers: {
											'Content-Type': 'application/octet-stream'
										},
										params: pixels
									}
								)
							).data;

							const assetIndex = pick.assets.findIndex((_) => {
								return _.collabAssetId === collabAsset.id;
							});

							if (assetIndex === -1) {
								pick.assets.push(asset);
							} else {
								pick.assets[assetIndex] = asset;
							}

							pick = pick;
						}}
						editable={true}
						imageDeleted={async () => {
							removeAsset(collabAsset.id);
						}}
					/>
				{/each}
			</div>
			<Character
				collab={pick.collab}
				submit={async (_, name) => {
					if (_) {
						pick.characterId = _?.id;
						pick.name = _?.name;
						pick.original = false;

						if (_.id === -1 && name) {
							pick.characterId = null;
							pick.name = name;
							pick.original = true;
						}
					}
					selected.update(null);

					updatePick({
						name: pick.name,
						characterId: pick.characterId,
						original: pick.original
					});
				}}
				{pick}
			/>
			<Extra
				{pick}
				onSubmit={async (data) => {
					pick.extra = data;

					await updatePick({
						extra: pick.extra,
						valid: true
					});
				}}
			/>
		</div>
	</div>
{/if}

<style lang="scss">
	#column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;

		#content {
			width: 100%;
			max-width: $max-width + $margin-s * 2;

			margin-top: $margin-m;

			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;

			#assets {
				width: 100%;
				max-width: $max-width + $margin-s * 2;

				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				align-items: stretch;

				flex-wrap: wrap;
			}
		}

		#discord {
			width: 100%;

			background-color: $card-color;
			box-shadow: $box-shadow;

			display: flex;
			flex-direction: row;
			justify-content: center;

			#user {
				width: 100%;
				max-width: $max-width + $margin-s * 2;

				display: flex;
				flex-direction: row;
				justify-content: center;
				align-items: flex-end;

				@media (min-width: $breakpoint-xs) {
					justify-content: space-between;
				}

				#discord-stats {
					display: flex;
					align-items: center;
					flex-direction: column;
					flex-wrap: wrap;

					width: 100%;

					@media (min-width: $breakpoint-xs) {
						flex-direction: row;
						align-items: flex-end;
					}

					#avatar {
						height: 160px;
						width: 160px;
						border-radius: 50%;
						margin: $margin-m;
						box-shadow: $box-shadow-light;
					}

					#stats {
						display: flex;
						flex-direction: column;
						justify-content: flex-end;

						gap: $margin-xs;

						margin: $margin-m;
						margin-top: 0;
						margin-left: $margin-s;
						align-items: center;

						flex-grow: 1;

						@media (min-width: $breakpoint-xs) {
							margin-top: unset;
							align-items: flex-start;
							margin-top: $margin-m;
						}

						.stat {
							display: flex;
							flex-direction: row;

							align-items: flex-start;

							p {
								padding: 0;
								margin: 0;
								margin-left: $margin-s;
							}

							#roles {
								display: flex;
								flex-wrap: wrap;

								max-width: 200px;

								justify-content: center;

								margin-top: $margin-s;

								@media (min-width: $breakpoint-xs) {
									margin-top: unset;
									max-width: unset;
									justify-content: start;
								}

								gap: $margin-xs;

								margin-left: $margin-s;

								#role {
									background-color: $dark-overlay;

									border-radius: 50px;
									border: solid 1px $dark-overlay;

									p {
										margin: 0;

										font-size: 12px;
										font-weight: 700;
										color: white;

										padding: calc($margin-xs / 4);
										padding-left: $margin-xs;
										padding-right: $margin-xs;
									}
								}
							}

							i {
								font-size: 16pt;
								color: white;
							}

							i.roleicon {
								display: none;

								@media (min-width: $breakpoint-xs) {
									display: inline;
								}
							}
						}
					}
				}
			}
		}
	}
</style>
