<script lang="ts">
	import { goto } from '$app/navigation';

	import { onMount } from 'svelte';

	import { discord, getDiscordProfilePicture, getFormattedDate } from '../../stores/discord';

	import SolidButton from '../../components/generic/design/solid_button.svelte';
	import axios from 'axios';
	import Connections from '../../components/profile/connections.svelte';
	import Picks from '../../components/profile/picks.svelte';
	import type { IDiscordRole } from '../../utils/discord/interfaces/role';
	import type { Bump } from '@prisma/client';

	let bumps: Bump[] = [];

	onMount(async () => {
		getBumps();
	});

	async function getBumps() {
		bumps = (await axios.get('/api/profile/bumps')).data;
	}

	async function bump() {
		await axios.patch('/api/bumps/bump');
		getBumps();
	}

	function getDisplayRoles(roles: IDiscordRole[]) {
		return roles.filter((role) => {
			return role.display;
		});
	}
</script>

{#if $discord}
	<div id="column">
		<div id="discord">
			<div id="user">
				<div id="discord-stats">
					<img id="avatar" src={getDiscordProfilePicture($discord)} alt="Discord avatar" />
					<div id="stats">
						<div class="stat">
							<i class="las la-user" />
							<p>{$discord.username + '#' + $discord.discriminator}</p>
						</div>
						{#if $discord.joinedAt}
							<div class="stat">
								<i class="las la-calendar" />
								<p>Joined {getFormattedDate($discord.joinedAt.toString())}</p>
							</div>
						{/if}
						{#if $discord.roles && getDisplayRoles($discord.roles).length > 0}
							<div class="stat">
								<i class="las la-tags roleicon" />
								<div id="roles">
									{#each getDisplayRoles($discord.roles) as role}
										<div id="role">
											<p>{role.name}</p>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<div id="buttons">
						{#if !$discord.joinedAt}
							<SolidButton
								string="discord.join"
								click={async () => {
									await axios.get('/api/auth/discord/join');
								}}
							/>
						{/if}
						{#if bumps.length > 0}
							<SolidButton string="bump" click={bump} />
						{/if}
						{#if $discord.admin}
							<SolidButton string="admin.title" click={() => goto('/admin')} />
						{/if}
					</div>
				</div>
			</div>
		</div>
		<div id="content">
			<Picks />
			<Connections />
			<div id="buttons">
				<!-- TODO: move delete to bottom of page -->
				<SolidButton click={() => goto('/')} color="red" string="account.delete" />
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
					}
				}
			}
		}

		#content {
			width: 100%;
			max-width: $max-width + $margin-s * 2;

			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;

			#buttons {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: flex-end;
				gap: $margin-s;

				margin: $margin-m;
				margin-top: $margin-l;
			}
		}
	}
</style>
