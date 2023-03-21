<script lang="ts">
	import { goto } from '$app/navigation';

	import { discord } from '../../stores/discord';

	import PageTitle from '../../components/generic/design/page_title.svelte';
	import AdminButton from '../../components/admin/admin_button.svelte';
	import { onDestroy, onMount } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';
	import axios from 'axios';

	let subscription: Unsubscriber | null = null;

	onMount(async () => {
		const result = await axios.get('/api/auth/discord/authenticated');

		if (!result.data.authenticated) {
			goto('/');
			return;
		}

		subscription = discord.subscribe((user) => {
			if (user && !user.admin) {
				goto('/');
			}
		});
	});

	onDestroy(() => {
		if (subscription) {
			subscription();
		}
	});
</script>

<div id="column">
	<div id="content">
		<div id="title">
			<PageTitle string="admin.title" />
		</div>
		<div id="buttons">
			<AdminButton
				onClick={() => goto('/admin/characters')}
				title="admin.buttons.characters.title"
				description="admin.buttons.characters.description"
			/>
		</div>
	</div>
</div>

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

			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: flex-start;

			padding-bottom: $margin-m;

			#title {
				display: flex;
				flex-direction: column;

				align-self: stretch;

				justify-content: space-between;

				padding: $margin-m;
				padding-top: $margin-l;
				padding-bottom: 0;

				gap: $margin-s;

				align-items: start;

				height: 55px;

				@media (min-width: 400px) {
					flex-direction: row;
				}
			}

			#buttons {
				display: flex;
				flex-direction: column;

				flex-wrap: wrap;

				padding: $margin-m;

				gap: $margin-s;

				@media (min-width: 400px) {
					flex-direction: row;
				}
			}
		}
	}
</style>
