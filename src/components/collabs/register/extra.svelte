<script lang="ts">
	import { t } from 'svelte-intl-precompile';
	import SolidButton from '../../generic/design/solid_button.svelte';
	import Card from '../../generic/design/card.svelte';
	import type { AnimeCharacter, Collab, CollabAsset, Pick } from '@prisma/client';
	import axios, { AxiosError } from 'axios';
	import InputText from '../../generic/design/input_text.svelte';
	import { goto } from '$app/navigation';
	import Dropdown from './extra/dropdown.svelte';
	import { ClientPaths } from '../../../utils/paths/client';

	export let collab: Collab & { collabAssets: CollabAsset[] };
	export let imageBuffer: ArrayBuffer;
	export let character: AnimeCharacter;

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

	const requestData: Partial<Pick> = {
		characterId: character.id !== -1 ? character.id : undefined,
		name: character.name,
		extra: {}
	};

	let skills = {
		stamina: '',
		tenacity: '',
		accuracy: '',
		precision: '',
		reaction: '',
		agility: ''
	};
	let gameSpecialty = '';
	let avatarText = '';

	async function register() {
		try {
			requestData.extra = {
				skills: skills,
				specialty: gameSpecialty,
				avatar: avatarText
			};

			try {
				await axios.get('/api/verify');
			} catch (error) {
				// !! may fail if the user isn't in the discord
			}

			const mainAsset = collab.collabAssets.find((asset) => asset.mainAsset);

			if (!mainAsset) {
				throw new Error('No main asset found');
			}

			const pick: Pick = (await axios.post(`/api/collabs/${collab.id}/register`, requestData)).data;

			await axios.post(ClientPaths.asset(collab.id, pick.id, mainAsset.id), imageBuffer, {
				headers: {
					'Content-Type': 'application/octet-stream'
				}
			});

			goto(`/collabs/${collab.id}/registered`);
		} catch (error) {
			if (error instanceof AxiosError) {
				goto(
					`/collabs/${collab.id}/error?error=${encodeURIComponent(
						error.response?.data['message'] ?? 'errors.unknown'
					)}`
				);
			} else {
				goto(`/collabs/${collab.id}/error?error=${encodeURIComponent('errors.unknown')}`);
			}
		}
	}
</script>

<h3>{$t('collabs.registration.extra.title')}</h3>
<div id="character">
	<Card>
		<div id="content">
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
				title={'collabs.registration.extra.avatar'}
				hint={'Wowzers'}
				max={11}
			/>
			<Dropdown
				bind:value={gameSpecialty}
				title="collabs.registration.extra.osu.specialty"
				placeholder="collabs.registration.extra.osu.specialty"
				data={specialties}
			/>

			<SolidButton
				click={register}
				color="green"
				string="collabs.registration.register"
				disabled={!(
					skills.stamina.length > 0 &&
					skills.tenacity.length > 0 &&
					skills.accuracy.length > 0 &&
					skills.precision.length > 0 &&
					skills.reaction.length > 0 &&
					skills.agility.length > 0 &&
					gameSpecialty.length > 0
				)}
			/>
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

		// max-width: 500px;
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
