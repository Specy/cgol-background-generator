<script>
	import Button from '$cmp/buttons/Button.svelte'
	import ColorPicker from '$cmp/ColorPicker.svelte'
	import { fade, scale } from 'svelte/transition'
	import FaPlus from 'svelte-icons/fa/FaPlus.svelte'

	import { flip } from 'svelte/animate'
	import ControlsOption from './ControlsOption.svelte'
	import FaTimes from 'svelte-icons/fa/FaTimes.svelte'
	import Icon from '$cmp/layout/Icon.svelte'
	import { DEFAULT_BACKGROUND, DEFAULT_COLOR } from '$lib/cgol'
	export let palette = []
	export let mainColor = DEFAULT_COLOR
	export let backgroundColor = DEFAULT_BACKGROUND
	function addColor() {
		palette = [...palette, '#ffffff']
	}
</script>

<div class="picker-grid">
	<h3>Main</h3>
	<ColorPicker bind:value={mainColor} />
	<h3>Background</h3>
	<ColorPicker bind:value={backgroundColor} />
	<h3>Palette</h3>
	<div class="picker-row">
		{#each palette as color, i (i)}
			<div
				animate:flip={{ duration: 300 }}
				out:scale={{ duration: 250 }}
				in:fade={{ duration: 250 }}
				class="color-wrapper"
			>
				<ColorPicker bind:value={color} />
				<Icon
					style="color:red; margin-left: 0.4rem"
					on:click={() => {
						palette = palette.filter((_, index) => index !== i)
					}}
				>
					<FaTimes />
				</Icon>
			</div>
		{/each}
		<Button on:click={addColor} style="padding: 0.3rem;  margin-right: 1.6rem;">
			<Icon style="width: 1.6rem; height: 1.6rem">
				<FaPlus />
			</Icon>
		</Button>
	</div>
</div>

<style>
	.color-wrapper {
		display: flex;
		align-items: center;
	}
	.picker-row{
		display:flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		padding-right: 0.8rem;
	}
	.picker-grid {
		display: grid;
		grid-template-columns: min-content auto;
		grid-gap: 0.5rem;
	}
	h3{
		white-space: nowrap;
		margin-right: 1rem;
		display: flex;
		align-items: center;
		height: 2.2rem;
	}
</style>
