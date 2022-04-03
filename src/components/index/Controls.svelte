<script lang="ts">
	import Button from '$cmp/buttons/Button.svelte'
	import NumberInput from '$cmp/inputs/NumberInput.svelte'
	import { createEventDispatcher } from 'svelte'
	import ControlRow from './ControlRow.svelte'
	import ControlsOption from './ControlsOption.svelte'
	import IoMdSettings from 'svelte-icons/io/IoMdSettings.svelte'
	import FaAngleLeft from 'svelte-icons/fa/FaAngleLeft.svelte'
	import FaCamera from 'svelte-icons/fa/FaCamera.svelte'
	import FaAngleRight from 'svelte-icons/fa/FaAngleRight.svelte'
	import Icon from '$cmp/layout/Icon.svelte'
	import PalettePicker from './PalettePicker.svelte'
	import ControlColumn from './ControlColumn.svelte'
	import MdFullscreen from 'svelte-icons/md/MdFullscreen.svelte'
	import MdFullscreenExit from 'svelte-icons/md/MdFullscreenExit.svelte'
	import { DEFAULT_BACKGROUND, DEFAULT_COLOR } from '$lib/cgol'
	import { browser } from '$app/env'
	const dispatch = createEventDispatcher()
	const stepDispatch = createEventDispatcher<{ step: number }>()
	export let scale = 1
	export let mainColor = DEFAULT_COLOR
	export let backgroundColor = DEFAULT_BACKGROUND
	export let palette = []
	export let isPlaying = true
	export let maxFps = 60
	export let trailToggled = true
	let isOpen = false
	let isFullscreen = false
</script>

<svelte:window on:fullscreenchange={() => isFullscreen = document.fullscreenElement !== null} />
<div class="floating-buttons">
	{#if browser && document?.fullscreenEnabled}
		<Button
			style="height: 2.5rem; width: 2.5rem; padding: 0.6rem; "
			hasIcon={true}
			on:click={() => {
				!document.fullscreenElement 
					? document.documentElement.requestFullscreen()
					: document.exitFullscreen()
			}}
		>
			<Icon>
				{#if isFullscreen}
					<MdFullscreenExit />
				{:else}

					<MdFullscreen />
				{/if}
			</Icon>
		</Button>
	{/if}
	<Button
		style="height: 2.5rem; width: 2.5rem; padding: 0.6rem; "
		hasIcon={true}
		on:click={() => dispatch('snapshot')}
	>
		<FaCamera />
	</Button>
	<Button
		style="height: 2.5rem; width: 2.5rem; padding: 0.5rem; "
		hasIcon={true}
		on:click={() => (isOpen = !isOpen)}
	>
		<IoMdSettings />
	</Button>
</div>
<div
	class="controls-mask"
	class:isOpen
	style={`background-color: var(--controls-background); color:var(--controls-text)`}
>
	<div class="controls">
		<ControlRow title="Controls" style="grid-area: a">
			<Button on:click={() => dispatch('clear')}>Clear</Button>
			<Button on:click={() => dispatch('randomize')}>Randomize</Button>
			<Button on:click={() => (isPlaying = !isPlaying)} style="width:4.5rem">
				{isPlaying ? 'Pause' : 'Play'}
			</Button>
			<Button on:click={() => (trailToggled = !trailToggled)}>
				Trail
				{trailToggled ? 'On' : 'Off'}
			</Button>
			<Button on:click={() => dispatch('step', -1)} disabled={isPlaying} hasIcon={true}>
				<Icon size={1.5}>
					<FaAngleLeft />
				</Icon>
			</Button>
			<Button on:click={() => stepDispatch('step', 1)} disabled={isPlaying} hasIcon={true}>
				<Icon size={1.5}>
					<FaAngleRight />
				</Icon>
			</Button>
		</ControlRow>

		<ControlRow title="Settings" style="grid-area: b">
			<ControlsOption name="Scale">
				<NumberInput
					bind:value={scale}
					style="width: 4rem; text-align:center; border-top-right-radius: 0; border-bottom-right-radius: 0; padding:0.6rem 0.2rem"
				/>
				<Button
					on:click={() => dispatch('scale', scale)}
					style="border-top-left-radius: 0; border-bottom-left-radius: 0; margin-left: -0.1rem"
				>
					Set
				</Button>
			</ControlsOption>
			<ControlsOption name="Max fps">
				<NumberInput
					bind:value={maxFps}
					style="margin-right: 0.4rem; width: 4rem;  text-align:center; padding:0.6rem 0.2rem"
				/>
			</ControlsOption>
			<ControlsOption>
				<Button on:click={() => dispatch('reset-settings')}>Reset Everything</Button>
			</ControlsOption>
		</ControlRow>
		<ControlColumn title="Colors" style="grid-area: c">
			<PalettePicker bind:palette bind:mainColor bind:backgroundColor />
		</ControlColumn>
	</div>
</div>

<style lang="scss">
	.floating-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 999;
	}
	.controls-mask {
		background-color: rgb(15 13 25 / 70%);
		width: 100%;
		position: fixed;
		transform: translateY(100%);
		bottom: 0;
		left: 0;
		transition: transform 0.6s, backdrop-filter 0.6s, background-color 0.1s, opacity 0.5s;
		border-top-left-radius: 1.8rem;
		border-top-right-radius: 1.8rem;
		opacity: 0;
		overflow: hidden;
	}
	.controls {
		display: grid;
		width: 100%;
		max-height: 50vh;
		overflow-y: auto;
		grid-template-areas:
			'a b'
			'c c';
		padding: 1.5rem 1rem 0rem 2rem;
	}

	.isOpen {
		transform: translateY(0);
		opacity: 1;
		backdrop-filter: blur(3px);
	}
	@supports not (backdrop-filter: blur(4px)) {
		.controls-mask {
			backdrop-filter: blur(0);
			background-color: rgb(15 13 25 / 85%);
		}
	}
	.icon {
		width: 1rem;
	}
	@media (max-width: 850px) {
		.controls {
			grid-template-areas: 'a' 'b' 'c';
			justify-items: flex-start;
			padding: 1.2rem;
			max-height: 65vh;
		}
	}
</style>
