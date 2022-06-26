<script lang="ts">
	import { t } from 'svelte-intl-precompile';

	import { osu } from '../../../stores/osu';

	const mode = $osu?.modes[0];

	let playTime: string | undefined;

	if (mode?.playTime) {
		const time = mode?.playTime;
		const total = time / 60 / 60;
		const hours = Math.floor(total);
		const minutes = Math.floor((total - hours) * 60);
		playTime = hours + 'h ' + minutes + 'm';
	}
</script>

<div id="details">
	<!-- TODO: add titles to i18n -->
	<div class="detail">
		<p id="title">Username</p>
		<p id="subtitle">{$osu?.username}</p>
	</div>
	<div class="detail">
		<p id="title">Country</p>
		<p id="subtitle">{$osu?.country}</p>
	</div>
	<div class="detail">
		<p id="title">Rank</p>
		<p id="subtitle">{mode?.rank ?? $t('osu.unranked')}</p>
	</div>
	<div class="detail">
		<p id="title">Country rank</p>
		<p id="subtitle">{mode?.countryRank ?? $t('osu.unranked')}</p>
	</div>
	<div class="detail">
		<p id="title">Level</p>
		<p id="subtitle">{mode?.level ?? 0}</p>
	</div>
	<div class="detail">
		<p id="title">PP</p>
		<p id="subtitle">{mode?.pp ?? 0}</p>
	</div>
	<div class="detail">
		<p id="title">Ranked score</p>
		<p id="subtitle">{mode?.rankedScore ?? 0}</p>
	</div>
	<div class="detail">
		<p id="title">Hit accuracy</p>
		<p id="subtitle">{(mode?.hitAccuracy ?? 0) + '%'}</p>
	</div>
	<div class="detail">
		<p id="title">Play count</p>
		<p id="subtitle">{mode?.playCount ?? 0}</p>
	</div>
	<div class="detail">
		<p id="title">Play time</p>
		<p id="subtitle">{playTime ? playTime : $t('osu.no_time')}</p>
	</div>
</div>

<style lang="scss">
	#details {
		display: flex;
		flex-wrap: wrap;
		gap: $margin-s;
		margin: $margin-s;
	}

	div.detail {
		#title {
			margin: 0;

			text-transform: uppercase;

			font-size: 10pt;
			font-weight: 700;
		}

		#subtitle {
			margin: 0;
		}
	}
</style>
