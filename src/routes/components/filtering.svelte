<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { t } from 'svelte-intl-precompile';

	const dispatch = createEventDispatcher<{
		search: {};
		sort: {};
		order: {};
		filter: {
			type: string;
			value: string | undefined;
		};
	}>();

	let cooldown: ReturnType<typeof setTimeout> | undefined;

	async function setSearchTimer() {
		if (cooldown) {
			clearTimeout(cooldown);
		}

		cooldown = setTimeout(() => {
			clearTimeout(cooldown);
			dispatch('search');
		}, 1000);
	}

	export let sorts: Array<string> | undefined = undefined;
	export let sortstrings: Array<string> | undefined = undefined;

	export let filters:
		| {
				[key: string]: {
					values: string[];
					strings: string[];
					placeholder: string;
				};
		  }
		| undefined = undefined;

	let filterValues: {
		[key: string]: string | undefined;
	} = {};

	onMount(() => {
		for (const filter in filters) {
			filterValues[filter] = undefined;
		}
	});

	function setFilter(filter: string, value: string | undefined) {
		dispatch('filter', {
			type: filter,
			value
		});
	}

	export let sort: string | undefined = undefined;
	export let order = 'asc';
	export let query = '';
</script>

<div id="filtering">
	<div id="search" class="filter">
		<i class="la la-search" />
		<input
			type="text"
			name={$t('filtering.search')}
			placeholder={$t('filtering.search')}
			bind:value={query}
			on:keyup={setSearchTimer}
		/>
	</div>

	{#if filters}
		{#each Object.keys(filters) as filter}
			{#if filters[filter]}
				<div id="filter" class="filter">
					<div id="dropdown">
						<div id="select">
							<select
								name="data"
								bind:value={filterValues[filter]}
								on:change={(element) => setFilter(filter, element.currentTarget.value)}
							>
								<option selected value={undefined}>
									{filters[filter].placeholder}
								</option>
								{#each filters[filter].values as item, index}
									<option value={item}>
										{filters[filter].strings.length > index ? filters[filter].strings[index] : item}
									</option>
								{/each}
							</select>
							<i class="la la-filter" />
						</div>
					</div>
				</div>
			{/if}
		{/each}
	{/if}

	{#if sorts && sortstrings}
		<div class="grouped">
			<div id="sort" class="filter">
				<div id="dropdown">
					<div id="select">
						<select name="data" bind:value={sort} on:change={() => dispatch('sort')}>
							{#each sorts as item, index}
								<option value={item}>
									{sortstrings.length > index ? sortstrings[index] : item}
								</option>
							{/each}
						</select>
						{#if !sort}
							<div id="wrapper">
								<p id="placeholder">{$t('filtering.sort.placeholder')}</p>
							</div>
						{/if}
						<i class="la la-sort" />
					</div>
				</div>
			</div>
			<div id="direction" class="filter">
				<button
					class="la la-sort-{order === 'desc' ? 'down' : 'up'}"
					on:click={() => {
						order = order === 'desc' ? 'asc' : 'desc';
						dispatch('order');
					}}
				/>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	i {
		position: absolute;
		font-size: $icon-size;
		font-weight: 600;
		color: white;
		padding: $margin-m 0;
		padding-left: $margin-l;
		top: 0;
		left: 0;
		pointer-events: none;
	}

	.grouped {
		display: flex;
		flex-direction: row;
		gap: $margin-xs;
	}

	input::placeholder {
		color: gray;
		opacity: 1;
		pointer-events: none;
	}

	input,
	select {
		&:focus {
			outline: none;
		}

		appearance: none;
		flex-grow: 1;
		min-width: 0;
		background: transparent;
		border: none;
		font-size: $font-size-body;
		font-weight: 600;
		color: white;
		box-shadow: none;
		padding: $margin-m;
		padding-left: calc($margin-xl * 2);
		padding-right: $margin-xl;
		cursor: pointer;
	}

	p {
		font-size: $font-size-body;
		font-weight: 600;
		pointer-events: none;
	}

	#placeholder {
		color: gray;
		position: absolute;

		top: 0;
		left: 0;
		right: 0;
		bottom: 0;

		margin-left: calc($margin-xl * 2);
		margin-right: calc($margin-l);

		display: flex;
		align-items: center;

		overflow: hidden;
		text-overflow: clip;
		white-space: nowrap;
	}

	.filter {
		position: relative;
		min-width: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		box-shadow: $box-shadow-light;
		background: $content-background-dark;
		border-radius: $border-radius-l;
	}

	#filtering {
		display: flex;
		flex-direction: column;
		gap: $margin-xs;

		@media (min-width: $breakpoint-xs) {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: flex-end;
		}

		#search {
			flex-grow: 4;
		}

		#sort {
			display: flex;
			flex-grow: 1;

			select {
				option {
					color: initial !important;
				}

				:active {
					border: 1px solid $dark-overlay;
				}
			}

			:focus {
				outline: none;
			}
		}

		#filter {
			display: flex;

			select {
				option {
					color: initial !important;
				}

				:active {
					border: 1px solid $dark-overlay;
				}
			}

			:focus {
				outline: none;
			}
		}

		#direction {
			button {
				background: none;
				border: none;
				font-size: $icon-size;
				font-weight: 600;
				color: white;
				padding: $margin-m;
				top: 0;
				left: 0;
				cursor: pointer;
			}
		}
	}
</style>
