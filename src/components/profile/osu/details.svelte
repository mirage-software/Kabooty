<script lang="ts">
	import { t } from 'svelte-intl-precompile';

	import { osu } from '../../../stores/osu';

	let playTime: string | undefined;

	if ($osu?.modes[0]?.playTime) {
		const time = $osu?.modes[0]?.playTime;
		const total = time / 60 / 60;
		const hours = Math.floor(total);
		const minutes = Math.floor((total - hours) * 60);
		playTime = hours + 'h ' + minutes + 'm';
	}
</script>

<div id="details">
	<!-- TODO: add titles to i18n -->
	<div class="detail">
		<p id="title">Global Rank</p>
		<p id="subtitle">{$osu?.modes[0]?.rank ?? $t('osu.unranked')}</p>
	</div>
	<div class="detail">
		<p id="title">Country Rank</p>
		<p id="subtitle">{$osu?.modes[0]?.countryRank ?? $t('osu.unranked')}</p>
	</div>
	<div class="detail">
		<p id="title">Level</p>
		<p id="subtitle">{$osu?.modes[0]?.level ?? 0}</p>
	</div>
	<div class="detail">
		<p id="title">PP</p>
		<p id="subtitle">{$osu?.modes[0]?.pp ?? 0}</p>
	</div>
	<div class="detail">
		<p id="title">Ranked Score</p>
		<p id="subtitle">{$osu?.modes[0]?.rankedScore ?? 0}</p>
	</div>
	<div class="detail">
		<p id="title">Hit Accuracy</p>
		<p id="subtitle">{($osu?.modes[0]?.hitAccuracy ?? 0) + '%'}</p>
	</div>
	<div class="detail">
		<p id="title">Play Count</p>
		<p id="subtitle">{$osu?.modes[0]?.playCount ?? 0}</p>
	</div>
	<div class="detail">
		<p id="title">Play Time</p>
		<p id="subtitle">{playTime ? playTime : $t('osu.no_time')}</p>
	</div>
</div>

<style lang="scss">
	#details {
		display: flex;
		flex-wrap: wrap;
		gap: $margin-m;
		margin: $margin-s;
	}

	div.detail {
		#title {
			margin: 0;

			font-size: 10pt;
			font-weight: 700;
		}

		#subtitle {
			margin: 0;
		}
	}
</style>
