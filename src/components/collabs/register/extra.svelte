<script lang="ts">
	import { t } from 'svelte-intl-precompile';
	import SolidButton from '../../generic/design/solid_button.svelte';
	import Card from '../../generic/design/card.svelte';
	import type { Pick } from '@prisma/client';
	import InputText from '../../generic/design/input_text.svelte';
	import Dropdown from './extra/dropdown.svelte';
	import { osu } from '../../../stores/osu';
	import { onDestroy, onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';

	export let pick: Pick | undefined = undefined;

	export let onSubmit:
		| ((data: {
				skills: {
					stamina: string;
					tenacity: string;
					accuracy: string;
					precision: string;
					reaction: string;
					agility: string;
				};
				specialty: string;
				avatar: string;
				card: { name: string; quote: string };
				mod: string;
				banner: { name: string; quote: string };
		  }) => Promise<void>)
		| undefined = undefined;

	let specialties = [
		'Aim',
		'Streams',
		'Speed',
		'Accuracy',
		'Reading',
		'Technical',
		'Finger Control',
		'Memory',
		'Precision',
		'Choke',
		'Sliderbreaks',
		'Gimmick',
		'Low AR'
	];

	let skills = (pick?.extra as any)?.skills ?? {
		stamina: '',
		tenacity: '',
		accuracy: '',
		precision: '',
		reaction: '',
		agility: ''
	};
	let gameSpecialty = (pick?.extra as any)?.specialty ?? '';

	let avatarText = (pick?.extra as any)?.avatar ?? $osu?.username ?? 'Unknown';
	let avatarValid: boolean;

	let bannerName = (pick?.extra as any)?.banner?.name ?? $osu?.username ?? 'Unknown';
	let bannerNameValid: boolean;

	let bannerQuote = (pick?.extra as any)?.banner?.quote ?? '';
	let bannerQuoteValid: boolean;

	let cardName = (pick?.extra as any)?.card?.name ?? $osu?.username ?? 'Unknown';
	let cardNameValid: boolean;

	let cardQuote = (pick?.extra as any)?.card?.quote ?? '';
	let cardQuoteValid: boolean;

	let favMod = (pick?.extra as any)?.mod ?? '';

	let subscription: Unsubscriber;

	onMount(() => {
		subscription = osu.subscribe((osuUser) => {
			if (avatarText === 'Unknown' && osuUser?.username) {
				avatarText = osuUser?.username;
			}

			if (bannerName === 'Unknown' && osuUser?.username) {
				bannerName = osuUser?.username;
			}

			if (cardName === 'Unknown' && osuUser?.username) {
				cardName = osuUser?.username;
			}
		});
	});

	onDestroy(() => {
		subscription();
	});

	async function submit() {
		if (onSubmit) {
			await onSubmit({
				skills: skills,
				specialty: gameSpecialty,
				avatar: avatarText,
				card: {
					name: cardName,
					quote: cardQuote
				},
				mod: favMod,
				banner: {
					name: bannerName,
					quote: bannerQuote
				}
			});
		}
	}

	import { writable } from 'svelte/store';

	export const isValidStore = writable(false);

	$: valid =
		skills.stamina.length > 0 &&
		skills.tenacity.length > 0 &&
		skills.accuracy.length > 0 &&
		skills.precision.length > 0 &&
		skills.reaction.length > 0 &&
		skills.agility.length > 0 &&
		gameSpecialty.length > 0 &&
		favMod.length === 2 &&
		avatarValid !== false &&
		avatarText.length > 0 &&
		bannerNameValid !== false &&
		bannerName.length > 0 &&
		bannerQuoteValid !== false &&
		cardNameValid !== false &&
		cardName.length > 0 &&
		cardQuoteValid !== false;

	$: {
		isValidStore.set(valid);
	}
</script>

<h3>{$t('collabs.registration.extra.title')}</h3>
<div id="character">
	<Card>
		<div id="content">
			{#if pick && !pick.valid}
				<h4 style="margin: 0;">
					{$t('collabs.registration.invalid')}
				</h4>
			{/if}
			<div id="title">
				<h4>{$t('collabs.registration.extra.card_title')}</h4>
				<h5>{$t('collabs.registration.extra.card_subtitle')}</h5>
			</div>

			<div id="explanation">
				1. Evaluate your Stamina in scale from D to S (Tapping stamina in case of all modes)<br />
				2. Evaluate your Tenacity in scale from D to S (Streams in case of std and taiko, and fast notes
				in mania and ctb)<br />
				3. Evaluate your Precision in scale from D to S (Ability to hit small circles in case of std,
				taiko(?) and small fruits in ctb and reading 7k in mania)<br />
				4. Evaluate your Reaction in scale from D to S (Sight Read in case of all modes)<br />
				5. Evaluate your Accuracy in scale from D to S<br />
				6. Evaluate your Agility in scale from D to S (Aim in case of std, pixel jump in ctb and reading
				anormal patterns in mania and taiko)
			</div>

			<div id="grid">
				<Dropdown
					bind:value={skills.stamina}
					title="collabs.registration.extra.osu.stamina"
					placeholder="collabs.registration.extra.osu.stamina"
					data={['S', 'A', 'B', 'C', 'D']}
				/>
				<Dropdown
					bind:value={skills.tenacity}
					title="collabs.registration.extra.osu.tenacity"
					placeholder="collabs.registration.extra.osu.tenacity"
					data={['S', 'A', 'B', 'C', 'D']}
				/>
				<Dropdown
					bind:value={skills.precision}
					title="collabs.registration.extra.osu.precision"
					placeholder="collabs.registration.extra.osu.precision"
					data={['S', 'A', 'B', 'C', 'D']}
				/>
				<Dropdown
					bind:value={skills.reaction}
					title="collabs.registration.extra.osu.reaction"
					placeholder="collabs.registration.extra.osu.reaction"
					data={['S', 'A', 'B', 'C', 'D']}
				/>
				<Dropdown
					bind:value={skills.accuracy}
					title="collabs.registration.extra.osu.accuracy"
					placeholder="collabs.registration.extra.osu.accuracy"
					data={['S', 'A', 'B', 'C', 'D']}
				/>
				<Dropdown
					bind:value={skills.agility}
					title="collabs.registration.extra.osu.agility"
					placeholder="collabs.registration.extra.osu.agility"
					data={['S', 'A', 'B', 'C', 'D']}
				/>
			</div>

			<InputText
				bind:value={avatarText}
				bind:valid={avatarValid}
				title={'collabs.registration.extra.avatar'}
				hint={'Tayo'}
				calculation={{ font: 'Montserrat', weight: 200, italic: true, size: 36, width: 250 }}
			/>
			<InputText
				bind:value={bannerName}
				bind:valid={bannerNameValid}
				title={'collabs.registration.extra.banner.name'}
				hint={'Tayo'}
				calculation={{ font: 'Montserrat', weight: 200, italic: true, size: 54, width: 415 }}
			/>
			<InputText
				bind:value={bannerQuote}
				bind:valid={bannerQuoteValid}
				title={'collabs.registration.extra.banner.quote'}
				hint={"If you follow the herd, you'll be stepping in poop all day."}
				multiline={true}
				height="54px"
				calculation={{ font: 'Montserrat', weight: 300, italic: true, size: 12, width: 550 }}
			/>
			<InputText
				bind:value={cardName}
				bind:valid={cardNameValid}
				title={'collabs.registration.extra.card.name'}
				hint={'Tayou-kun Queso'}
				calculation={{ font: 'Montserrat', weight: 200, italic: true, size: 36, width: 300 }}
			/>
			<InputText
				bind:value={cardQuote}
				bind:valid={cardQuoteValid}
				title={'collabs.registration.extra.card.quote'}
				hint={"I don't really know any quotes honestly."}
				multiline={true}
				height="54px"
				calculation={{ font: 'Montserrat', weight: 200, italic: true, size: 8, width: 320 }}
			/>
			<Dropdown
				bind:value={gameSpecialty}
				title="collabs.registration.extra.osu.specialty"
				placeholder="collabs.registration.extra.osu.specialty"
				data={specialties}
			/>
			<Dropdown
				bind:value={favMod}
				title="collabs.registration.extra.osu.mod"
				placeholder="collabs.registration.extra.osu.mod"
				data={[
					'NM',
					'EZ',
					'NF',
					'HT',
					'DC',
					'HR',
					'SD',
					'PF',
					'DT',
					'NC',
					'HD',
					'FI',
					'FL',
					'RL',
					'AP',
					'SO',
					'DA'
				]}
				strings={[
					'No Mod (NM)',
					'Easy (EZ)',
					'No Fail (NF)',
					'Half Time (HT)',
					'Daycore (DC)',
					'Hard Rock (HR)',
					'Sudden Death (SD)',
					'Perfect (PF)',
					'Double Time (DT)',
					'Nightcore (NC)',
					'Hidden (HD)',
					'Fade In (FI)',
					'Flashlight (FL)',
					'Relax (RL)',
					'Autopilot (AP)',
					'Spun Out (SO)',
					'Difficulty Adjust (DA)'
				]}
			/>

			{#if onSubmit}
				<SolidButton
					click={submit}
					color="green"
					string={pick ? 'collabs.registration.submit' : 'collabs.registration.register'}
					disabled={!valid}
				/>
			{/if}
		</div>
	</Card>
</div>

<style lang="scss">
	h3 {
		margin: $margin-m;
		margin-top: $margin-s;
	}

	h4 {
		margin: 0;
	}

	h5 {
		margin: 0;
		font-weight: 400;
		font-style: italic;
	}

	#explanation {
		display: flex;

		flex-direction: column;
		gap: calc($margin-xs / 4);

		width: calc(100% - $margin-s * 2);

		background-color: $dark-overlay;
		padding: $margin-s;

		border-radius: $border-radius-s;

		color: white;
	}

	#character {
		margin: $margin-m;
		margin-top: 0;
		margin-bottom: $margin-m;

		width: 100%;
		max-width: calc(100% - $margin-m * 2);

		#content {
			padding: $margin-m;

			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: $margin-m;

			#title {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
			}

			#grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(140px, 4fr));
				grid-gap: $margin-s;

				width: 100%;
				max-width: 400px;
			}
		}
	}
</style>
