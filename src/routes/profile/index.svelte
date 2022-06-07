<script lang="ts">
	import { goto } from '$app/navigation';

	import { onMount } from 'svelte';

	import { discord, getDiscordProfilePicture } from '../../stores/discord';

	import SolidButton from '../../components/generic/design/solid_button.svelte';
	import axios from 'axios';

	onMount(async () => {
		const result = await axios.get('/api/discord/authenticated');

		if (!result.data.authenticated) {
			goto('/');
		}
	});
</script>

<div id="column">
	<div id="discord">
		{#if $discord}
			<div id="user">
				<div id="discord-stats">
					<img id="avatar" src={getDiscordProfilePicture($discord)} alt="Discord avatar" />
					<div id="stats">
						<div class="stat">
							<i class="las la-user" />
							<p>{$discord.username + '#' + $discord.discriminator}</p>
						</div>
						<div class="stat">
							<i class="las la-calendar" />
							<p>Joined 06-04-2000</p>
						</div>
						<div class="stat">
							<i class="las la-tags" />
							<p>Roles</p>
						</div>
					</div>
				</div>
				<div id="buttons">
					<SolidButton click={async () => {
						const state = await axios.get('/api/osu/authorize');
						goto(state.data.url);
					}} color="green" string="osu.connect" />
					<!-- TODO: move delete to bottom of page -->
					<SolidButton click={() => goto('/')} color="red" string="account.delete" />
				</div>
			</div>
		{/if}
	</div>
	<div id="stats">
		<!--  -->
	</div>
</div>

<style lang="scss">
	#column {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100%;

		#discord {
			width: 100%;

			background-color: #5d3432;
			box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.08);

			display: flex;
			flex-direction: row;
			justify-content: center;

			#user {
				width: 100%;
				max-width: $max-width + $margin-s * 2;

				display: flex;
				flex-direction: row;
				justify-content: space-between;
				align-items: flex-end;

				#discord-stats {
					display: flex;
					align-items: flex-end;

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

						gap: calc($margin-xs / 2);

						margin: $margin-m;
						margin-left: $margin-s;

						.stat {
							display: flex;
							flex-direction: row;

							align-items: center;

							p {
								padding: 0;
								margin: 0;
								margin-left: $margin-s;
							}

							i {
								font-size: 16pt;
								color: white;
							}
						}
					}
				}

				#buttons {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: flex-end;
					gap: $margin-s;

					margin: $margin-m;
				}
			}
		}
	}
</style>
