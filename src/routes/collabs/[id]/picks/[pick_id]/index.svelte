<script lang="ts">
	import { onMount } from 'svelte';

	import axios from 'axios';
	import {
		discord,
		getDiscordProfilePicture,
		getFormattedDate
	} from '../../../../../stores/discord';
	import SolidButton from '../../../../../components/generic/design/solid_button.svelte';
	import type { AnimeCharacter, Asset, CollabAsset, User, Pick, Collab } from '@prisma/client';
	import { ClientPaths } from '../../../../../utils/paths/client';
	import { t } from 'svelte-intl-precompile';
	import IconButton from '../../../../../components/collabs/icon_button.svelte';
	import { page } from '$app/stores';
	import type { IDiscordRole } from '../../../../../utils/discord/interfaces/role';
	import type { IDiscordUser } from '../../../../../utils/discord/interfaces/user';
	import Extra from '../../../../../components/collabs/register/extra.svelte';
	import AssetComponent from '../../../../../components/collabs/pick/asset.svelte';
	import Character from '../../../../../components/collabs/register/character.svelte';
	import type { Writable } from 'svelte/store';

	let pick: Pick & {
		user: User;
		character: AnimeCharacter;
		assets: (Asset & { collabAsset: CollabAsset })[];
		collab: Collab & {
			collabAssets: CollabAsset[];
		};
	};

	let discordUser: IDiscordUser;

	let _window: Window | undefined;

	onMount(async () => {
		_window = window;

		const pickId = $page.params['pick_id'];

		pick = (await axios.get('/api/picks/' + pickId)).data;
		discordUser = (await axios.get('/api/discord/user/' + pick.userId)).data;
	});

	function getDisplayRoles(roles: IDiscordRole[]) {
		return roles.filter((role) => {
			return role.display;
		});
	}

	async function deletePick() {
		if (!_window) {
			return;
		}

		let confirmed = false;
		let reason: string | null = '';

		if ($discord?.admin && pick.userId !== $discord?.id) {
			reason = _window.prompt('Whats the reason for the deletion?', 'Duplicate Pick');
			if (reason) {
				confirmed = true;
			}
		}

		if (pick.userId === $discord?.id) {
			confirmed = _window.confirm($t('collabs.delete_pick_confirm'));
		}

		if (confirmed) {
			await axios.delete('/api/picks/' + pick.id, {
				data: {
					reason: reason
				}
			});
			_window.alert('Pick Deleted');
		}
	}

	let pageIndex = 1;
	let data: (Pick & {
		user: User;
		character: AnimeCharacter;
		assets: (Asset & { collabAsset: CollabAsset })[];
	})[] = [];

	let loading = true;

	async function getPicks() {
		data = (
			await axios.get(
				'/api/collabs/' + pick.collabId + '/picks?page=' + pageIndex + '&query=&sort=date&order=asc'
			)
		).data;
		if (data.length !== 25) {
			loading = false;
		}
	}

	let valid: Writable<boolean>;

	async function runPickValidation() {
		console.log('---- START PICK VALIDATION ----');
		pageIndex = 1;
		data = [];
		loading = true;

		while (loading) {
			await getPicks();

			for (let i = 0; i < data.length; i++) {
				const _pick = data[i];

				if (!_pick.valid) {
					continue;
				}

				pick.extra = _pick.extra;

				pick = pick;

				setTimeout(() => {
					// !! wait 25ms for frontend to settle
				}, 25);

				console.log($valid);
			}
		}

		// await axios.delete('/api/picks/' + pick.id, {
		// 	data: {
		// 		reason: reason
		// 	}
		// });
	}

	async function reportPick() {
		if (!_window) {
			return;
		}

		const response = _window.prompt(
			'What would you like to report the pick for? There\'s no need to report for a missing image, or when the pick is not a duplicate, or not in the character database. Valid reasons are for example, "inappropriate image", "duplicate pick", or something along those lines.',
			'Duplicate pick'
		);

		if (response) {
			await axios.post('/api/picks/' + pick.id + '/report', {
				report: response
			});

			_window.alert('Pick reported');
		}
	}

	async function removeAsset(collabAssetId: string) {
		const assetIndex = pick.assets.findIndex((_) => {
			return _.collabAssetId === collabAssetId;
		});

		pick.assets.splice(assetIndex, 1);

		pick = pick;
	}
</script>

{#if discordUser && pick}
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

					<div id="buttons">
						<div id="icon-buttons">
							{#if $discord?.admin}
								<div id="admin">
									<IconButton icon="la la-trash" click={deletePick} />
								</div>
								<div id="admin">
									<IconButton
										icon="la la-pencil"
										href={'/collabs/' + pick.collabId + '/picks/' + pick.id + '/edit'}
									/>
								</div>
							{/if}
							{#if $discord?.id === '675733770610933761'}
								<div id="admin">
									<IconButton icon="la la-sync" click={runPickValidation} />
								</div>
							{/if}
						</div>
						<SolidButton click={reportPick} string={'picks.report'} color="red" />
					</div>
				</div>
			</div>
		</div>
		<div id="content">
			<div id="character">
				{#if pick.original}
					<h4>Original</h4>
				{/if}
				{#if pick.character}
					<h4>{pick.character.anime_name}</h4>
				{/if}
				<h2>{pick.name}</h2>
			</div>
			<div id="assets">
				{#each pick.collab.collabAssets as collabAsset}
					<AssetComponent
						{collabAsset}
						asset={pick.assets.find((_) => {
							return _.collabAssetId === collabAsset.id;
						})}
						editable={false}
						imageDeleted={async () => {
							removeAsset(collabAsset.id);
						}}
					/>
				{/each}
			</div>
			<div id="extra">
				<Extra {pick} bind:isValidStore={valid} />
			</div>
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

			#character {
				width: 100%;
				max-width: $max-width + $margin-s * 2;

				margin: $margin-m;
				margin-top: 0;
				margin-bottom: 0;

				h2,
				h4 {
					padding: 0;
					margin: 0;
				}

				h4 {
					margin-bottom: $margin-xs;
					font-weight: 700;
					color: white;
					font-style: italic;
				}
			}

			#assets {
				width: 100%;
				max-width: $max-width + $margin-s * 2;

				display: flex;
				flex-direction: row;
				justify-content: flex-start;
				align-items: stretch;

				flex-wrap: wrap;
			}

			#extra {
				width: 100%;
				pointer-events: none;
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

					#buttons {
						display: flex;
						flex-direction: row;
						justify-content: center;
						align-items: center;
						gap: $margin-s;
						margin: $margin-m;
						margin-top: 0;
						flex-wrap: wrap;

						#icon-buttons {
							display: flex;
							flex-direction: row;
							align-items: center;

							gap: $margin-xs;

							align-self: flex-end;
						}
					}
				}
			}
		}
	}
</style>
