<script>
	import { base } from '$app/paths';
	import { t } from 'svelte-intl-precompile';
	import { clientHeight } from './footer';
</script>

<footer bind:clientHeight={$clientHeight}>
	<div id="decoration">
		<!-- svelte-ignore a11y-missing-attribute -->
		<div id="image" />
	</div>
	<div id="container">
		<div id="content">
			<div class="section">
				<h4>{$t('footer.socials')}</h4>
				<div class="socials">
					<a href="https://discord.gg/dkdmCAfnpP" target="_blank" rel="noreferrer"
						><i class="lab la-discord" />
					</a>
					<a href="https://twitter.com/endlessmiragetv" target="_blank" rel="noreferrer"
						><i class="lab la-twitter" />
					</a>
					<a href="https://www.twitch.tv/endlessmiragetv" target="_blank" rel="noreferrer"
						><i class="lab la-twitch" />
					</a>
				</div>
			</div>
			<div class="section">
				<h4>{$t('footer.more')}</h4>
				<div class="links">
					<a href="{base}/privacy">{$t('footer.privacy')}</a>
					<a href="{base}/cookies">{$t('footer.cookies')}</a>
					<a href="{base}/characters">{$t('footer.characters')}</a>
					<a href="{base}/admin">{$t('footer.admin')}</a>
					<a href="{base}/statistics">{$t('footer.statistics')}</a>
				</div>
			</div>
		</div>
		<div id="initiative">
			<h6>
				{$t('footer.open_source')}
				<a href="https://repose.software/" target="_blank" rel="noreferrer">{$t('footer.repose')}</a
				>.
				{$t('footer.contributors')}
				<a href="https://github.com/mirage-software/Kabooty" target="_blank" rel="noreferrer"
					>{$t('footer.github')}</a
				>.
			</h6>
		</div>
	</div>
</footer>

<style lang="scss">
	footer {
		background: $content-background-dark;
		box-shadow: $box-shadow;
		padding: $margin-xxl;
		display: flex;
		justify-content: center;
		position: relative;

		#decoration {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			right: 0;
			overflow: hidden;

			pointer-events: none;

			#image {
				position: absolute;
				width: 100%;
				height: 100%;
				opacity: 0.02;
				background-image: url(/assets/decoration.svg);
				background-repeat: no-repeat;
				background-size: cover;
			}
		}

		#container {
			display: flex;
			justify-content: space-between;
			width: 100%;
			max-width: $max-width;

			flex-direction: column;
			gap: $margin-l;

			#content {
				display: flex;
				flex-direction: column;
				gap: $margin-l;
			}

			#initiative {
				display: flex;
				flex-direction: column;
				gap: calc($margin-xs / 2);

				a {
					opacity: 1;
					text-decoration: underline;
				}
			}
		}

		h4 {
			margin-bottom: $margin-xs;
		}

		a {
			opacity: 0.4;
			transition: opacity 0.2s;
		}

		a:hover {
			opacity: 1;
		}

		.links {
			display: grid;
			column-gap: $margin-l;
			row-gap: calc($margin-xs / 4);

			@media (min-width: $breakpoint-xs) {
				grid-template-columns: repeat(2, 1fr);
			}

			@media (min-width: $breakpoint-s) {
				display: flex;
				gap: $margin-m;
			}
		}

		.section {
			@media (min-width: $breakpoint-s) {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
		}

		.socials {
			i {
				color: white;
				font-size: 36px;
			}

			display: flex;
			gap: $margin-xs;
		}
	}
</style>
