<script lang="ts">
	import type {
		Collab,
		CollabAsset,
		CollabEarlyAccess,
		Guild,
		GuildRole,
		User,
		UserGuildRole
	} from '@prisma/client';
	import { t } from 'svelte-intl-precompile';

	import { base } from '$app/paths';
	import PrimaryButton from '../../../components/buttons/primary_button.svelte';

	export let dataUrl: string | null = null;
	export let collab: Partial<
		Collab & {
			guild:
				| (Guild & {
						userRoles: UserGuildRole[];
				  })
				| null;
			collabAssets: CollabAsset[];
			earlyAccessRoles: (CollabEarlyAccess & {
				guildRole: GuildRole;
			})[];
			_count: {
				participants: number;
			};
		}
	> | null = null;

	$: canRegister =
		collab?.status === 'OPEN' ||
		(collab?.status === 'EARLY_ACCESS' &&
			collab.earlyAccessRoles?.find((earlyAccessRole) => {
				return (
					collab?.guild?.userRoles.find((userRole) => {
						return userRole.guildRoleId === earlyAccessRole.guildRoleId;
					}) !== undefined
				);
			}) !== undefined);
</script>

{#if collab}
	<a href={collab?.id ? `${base}/collabs/${collab.id}` : `${base}/collabs`}>
		<div id="card">
			<div id="container">
				<div>
					{#if dataUrl || collab.logo}
						<div id="image-container">
							<img
								id="image"
								src={dataUrl ? dataUrl : '/api/assets/collabs/' + collab?.logo}
								alt={collab.title}
							/>
						</div>
					{/if}
				</div>
				<div id="info">
					<div class="info">
						{#if collab.status}
							{#if collab.bumpStatus === 'ENABLED'}
								<h6 style="margin-bottom: 0;">{$t('collabs.status.' + collab.status)}</h6>
								<h6 id="bump">{$t('collabs.bump_status.' + collab.bumpStatus)}</h6>
							{:else}
								<h6>{$t('collabs.status.' + collab.status)}</h6>
							{/if}
						{/if}
						<h4>{collab.title}</h4>
						<h5>{collab.topic}</h5>
					</div>
					<div id="guild">
						<h6>
							{collab._count?.participants ?? 0}
							{#if collab._count?.participants === 1}
								{$t('collabs.card.participant').toLowerCase()}
							{:else}
								{$t('collabs.card.participants').toLowerCase()}
							{/if}
						</h6>
						<!-- TODO: show guild information if present -->
					</div>
					<div id="buttons">
						<div id="view">
							<PrimaryButton content={$t('collabs.card.view')} />
						</div>
						{#if canRegister}
							<a href="{base}/collabs/${collab.id}/register">
								<PrimaryButton content={$t('collabs.card.register')} />
							</a>
						{/if}
						<!-- TODO: move to collab/[id] page -->
						<!-- {#if $discord?.admin}
								<div id="admin">
									<IconButton
										icon="la la-pencil"
										click={() => {
											if (collab?.id) {
												goto(`/collabs/${collab.id}/manage`);
											}
										}}
									/>
									<IconButton
										icon="la la-trash"
										click={() => {
											alert('Not implemented yet');
										}}
									/>
								</div>
							{/if} -->
					</div>
				</div>
			</div>
		</div>
	</a>
{/if}

<style lang="scss">
	#card {
		display: flex;
		flex-direction: column;

		background-color: $card-color;
		width: 100%;
		height: 100%;
		border-radius: $border-radius-s;

		transition: box-shadow 0.1s ease;

		box-shadow: $box-shadow-light;

		&:hover {
			box-shadow: $box-shadow-big !important;
		}
	}

	#container {
		display: flex;
		flex-direction: column;

		height: 100%;

		#image-container {
			background: $dark-overlay;
			padding: $margin-s;
			border-radius: $margin-xs;
			display: flex;
			justify-content: center;

			#image {
				// width: 100%;
				max-width: 100%;
				max-height: 200px;
				border-radius: calc($margin-xs / 2);
			}
		}

		#info {
			display: flex;
			flex-direction: column;

			margin: $margin-s;

			justify-content: space-between;

			gap: $margin-s;

			height: 100%;

			div.info {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}

			h5 {
				opacity: 0.5;
			}

			h6 {
				margin-bottom: $margin-xs;

				&#bump {
					opacity: 0.5;
				}
			}

			#buttons {
				display: flex;
				flex-direction: row;

				justify-content: space-between;

				// position: relative;

				flex-wrap: wrap;
				gap: $margin-xs;

				width: 100%;

				div,
				a {
					flex-grow: 1;
				}
			}
		}
	}
</style>
